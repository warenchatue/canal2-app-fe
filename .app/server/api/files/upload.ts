import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const action = (query.action as string) || ''
  const slug = (query.slug as string) || 'unnamed'
  const files = await readMultipartFormData(event)
  const fileUrls: string[] = []

  if (files?.length) {
    if (action == 'new-signature') {
      let dirName = `${path.join('.app', 'public')}`

      try {
        let fileName = slug
        let newPath = `${dirName}/${fileName}`

        fs.writeFile(newPath, files[0].data, { flag: 'w' }, function (err) {
          if (err) {
            console.log(err)
            return { success: false, count: 0 }
          }
          console.log(`${fileName} Successfully uploaded`)
        })

        fileUrls.push(fileName)
        return { success: true, count: 1 }
      } catch (error) {
        return { success: false, count: 0 }
      }
    } else if (action == 'new-xx') {
      let dirName = `${path.join('.app', 'public', 'uploads', 'signatures')}`

      try {
        fs.mkdir(dirName, function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log('New directory successfully created.')
            //  files[0].type.split('/')[1]
            //logo
            let fileName = 'uploads/signatures/' + slug + '.png'
            let newPath = `${path.join('.app', 'public', fileName)}`

            fs.writeFile(newPath, files[0].data, { flag: 'w' }, function (err) {
              if (err) {
                console.log(err)
                return { success: false, count: 0 }
              }
              console.log(`${fileName} Successfully uploaded`)
            })

            fileUrls.push(fileName)
          }
        })
        return { success: true, count: 2 }
      } catch (error) {
        return { success: false, count: 0 }
      }
    }
  }
})
