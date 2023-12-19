import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const action = (query.action as string) || ''
  const token = (query.token as string) || ''
  const slug = (query.slug as string) || 'unnamed'
  const dir = (query.dir as string) || 'unnamed'
  const startDate = decodeURIComponent((query.startDate as string) || '')
  const endDate = decodeURIComponent((query.endDate as string) || '')
  const files = await readMultipartFormData(event)
  const fileUrls: string[] = []

  if (files?.length) {
    if (action == 'new-signature') {
      let dirName = `${path.join('.app', 'public')}`

      try {
        let fileName = slug
        let newPath = `${dirName}/${fileName}`

        await fs.writeFile(
          newPath,
          files[0].data,
          { flag: 'w' },
          function (err) {
            if (err) {
              console.log(err)
              return { success: false, count: 0 }
            }
            console.log(`${fileName} Successfully uploaded`)
          },
        )

        fileUrls.push(fileName)
        return { success: true, count: 1 }
      } catch (error) {
        return { success: false, count: 0 }
      }
    } else if (action == 'import-playlist') {
      let dirName = `${path.join('.app', 'public')}`

      try {
        let fileName = 'uploads/playlists/' + files[0].filename
        let newPath = `${dirName}/${fileName}`

        const { success } = await newPlaylist(
          dirName,
          fileName,
          startDate,
          endDate,
          newPath,
          files,
          token,
        )

        return { success }
      } catch (error) {
        return { status: 'OK', success: false, count: 0 }
      }
    } else if (action == 'import-announcer') {
      let dirName = `${path.join('.app', 'public')}`

      try {
        let fileName = 'uploads/announcers/' + files[0].data
        let newPath = `${dirName}/${fileName}`

        const { success } = await newAnnouncers(
          dirName,
          fileName,
          newPath,
          files,
          token,
        )

        return { success }
      } catch (error) {
        return { status: 'OK', success: false, count: 0 }
      }
    } else if (action == 'import-product-file') {
      try {
        const dirName = `${path.join('.app', 'public')}`
        const code = makeId(5)
        if (files.length != 0) {
          let fileName =
            dir +
            '/' +
            files[0].filename +
            '-' +
            code +
            '.' +
            files[0].type.split('/')[1]
          let newPath = `${dirName}/${fileName}`
          await fs.writeFile(
            newPath,
            files[0].data,
            { flag: 'w' },
            await function (err) {
              if (err) {
                console.log(err)
                return { success: false, count: 0, fileName: '' }
              }
              console.log(`${fileName} Successfully uploaded`)
            },
          )
          return { success: true, count: 1, fileName }
        }
      } catch (error) {
        return { success: false, count: 0 }
      }
    } else if (action == 'new-single-file') {
      try {
        const dirName = `${path.join('.app', 'public')}`
        const code = makeId(10)
        if (files.length != 0) {
          let fileName = dir + '/' + code + '.pdf'
          let newPath = `${dirName}/${fileName}`
          await fs.writeFile(
            newPath,
            files[0].data,
            { flag: 'w' },
            await function (err) {
              if (err) {
                console.log(err)
                return { success: false, count: 0, fileName: '' }
              }
              console.log(`${fileName} Successfully uploaded`)
            },
          )
          return { success: true, count: 1, fileName }
        }
      } catch (error) {
        return { success: false, count: 0 }
      }
    }
  }
})

async function newPlaylist(
  dirName: string,
  fileName: string,
  startDate: string,
  endDate: string,
  newPath: string,
  files: any,
  token: string,
) {
  fs.writeFile(newPath, files[0].data, { flag: 'w' }, function (err) {
    if (err) {
      console.log(err)
      return { success: false, count: 0 }
    }
    console.log(`${fileName} Successfully uploaded`)
  })

  // const content = fs.readFileSync(dirName + '/' + fileName, 'utf8')
  const content = files[0].data.toString()
  console.log(startDate)
  console.log(endDate)
  const planningsPlayed = []
  const plannings = await findPlanningsNotPlay(startDate, endDate, token)
  for (let index = 0; index < plannings.length; index++) {
    const code = plannings[index]
    const codeFinal = '[' + code + ']'
    if (content) {
      if (content.includes(codeFinal)) {
        console.log(`Good ${code} exists`)
        planningsPlayed.push(code)
      } else {
        console.log(`Bad ${code} does not exists`)
      }
    }
  }
  console.log(planningsPlayed)
  const resp = await updateDiffusedByCodes(planningsPlayed, token)

  return {
    success: resp ? true : false,
    count: 1,
  }
}

async function newAnnouncers(
  dirName: string,
  fileName: string,
  newPath: string,
  files: any,
  token: string,
) {
  // fs.writeFile(newPath, files[0].data, { flag: 'w' }, function (err) {
  //   if (err) {
  //     console.log(err)
  //     return { success: false, count: 0 }
  //   }
  //   console.log(`${fileName} Successfully uploaded`)
  // })

  // const content = fs.readFileSync(dirName + '/' + fileName, 'utf8')
  const content = files[0].data.toString()
  const rows = content.split('\n')
  const finalContent = rows.map((row: any) => row.split(','))
  console.log(finalContent.length)
  for (let index = 1; index < finalContent.length; index++) {
    const el = finalContent[index]
    console.log('createAnnouncer ' + token)
    const runtimeConfig = useRuntimeConfig()
    const data: any = await $fetch(runtimeConfig.env.apiUrl + '/announcers', {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: {
        name: el[1],
        phone: el[3],
        phone2: el[3],
      },
    }).catch((error) => console.log(error))
    console.log(data)
  }

  return {
    success: true,
    count: 1,
  }
}

async function findPlanningsNotPlay(
  startDate: string,
  endDate: string,
  token: string,
) {
  console.log('findAll ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/notDiffused/code',
    {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: {
        beginDate: startDate.replaceAll('"', ''),
        endDate: endDate.replaceAll('"', ''),
      },
    },
  ).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

async function updateDiffusedByCodes(codes: string[], token: string) {
  console.log('updateDiffusedByCodes ' + token)
  const runtimeConfig = useRuntimeConfig()
  const data: any = await $fetch(
    runtimeConfig.env.apiUrl + '/plannings/autoValidate/codes',
    {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-type': 'application/json',
      },
      body: {
        codes,
      },
    },
  ).catch((error) => console.log(error))
  console.log(data)
  return Promise.resolve(data)
}

function makeId(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
