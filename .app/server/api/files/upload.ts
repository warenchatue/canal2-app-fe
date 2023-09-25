import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const action = (query.action as string) || ''
  const slug = (query.slug as string) || 'unnamed'
  const files = await readMultipartFormData(event)
  // console.log(files)
  const fileUrls: string[] = []

  if (files?.length) {
    if (action == 'new-org') {
      let dirName = `${path.join('.app', 'public', 'uploads', slug)}`

      try {
        fs.mkdir(dirName, function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log('New directory successfully created.')
            //  files[0].type.split('/')[1]
            //logo
            let companyLogoName = 'uploads/' + slug + '/logo.png'
            let newPath = `${path.join('.app', 'public', companyLogoName)}`

            fs.writeFile(newPath, files[0].data, { flag: 'w' }, function (err) {
              if (err) {
                console.log(err)
                return { success: false, count: 0 }
              }
              console.log(`${companyLogoName} Successfully uploaded`)
            })

            fileUrls.push(companyLogoName)

            //cover
            let companyCoverName = 'uploads/' + slug + '/cover.png'
            newPath = `${path.join('.app', 'public', companyCoverName)}`

            fs.writeFile(newPath, files[1].data, { flag: 'w' }, function (err) {
              if (err) {
                console.log(err)
                return { success: false, count: 1 }
              }
              console.log(`${companyCoverName} Successfully uploaded`)
            })
            fileUrls.push(companyCoverName)
          }
        })
        return { success: true, count: 2 }
      } catch (error) {
        return { success: false, count: 0 }
      }
    }
  }
})
