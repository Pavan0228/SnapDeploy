const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')
require('dotenv').config({
    path: path.join(__dirname, '.env')
})

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const PROJECT_ID = process.env.PROJECT_ID

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
    }
}

async function init() {
    try {
        console.log('Executing script.js')
        console.log('Build Started...')
        
        const outDirPath = path.join(__dirname, 'output')
        ensureDirectoryExists(outDirPath)

        return new Promise((resolve, reject) => {
            const p = exec(`cd ${outDirPath} && npm install && npm run build`)

            p.stdout.on('data', function (data) {
                console.log(data.toString())
            })

            p.stderr.on('data', function (data) {
                console.error('Error:', data.toString())
            })

            p.on('error', function (error) {
                console.error('Process error:', error)
                reject(error)
            })

            p.on('close', async function (code) {
                if (code !== 0) {
                    const error = new Error(`Build process exited with code ${code}`)
                    console.error(error.message)
                    return reject(error)
                }

                console.log('Build Complete')

                try {
                    const distFolderPath = path.join(__dirname, 'output', 'dist')
                    
                    // Check if dist folder exists after build
                    if (!fs.existsSync(distFolderPath)) {
                        throw new Error('Dist folder not found after build')
                    }

                    const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

                    console.log('Starting to upload')
                    for (const file of distFolderContents) {
                        const filePath = path.join(distFolderPath, file)
                        if (fs.lstatSync(filePath).isDirectory()) continue;

                        console.log('uploading', filePath)

                        const command = new PutObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME,
                            Key: `__outputs/${PROJECT_ID}/${file}`,
                            Body: fs.createReadStream(filePath),
                            ContentType: mime.lookup(filePath)
                        })

                        await s3Client.send(command)
                        console.log('uploaded', filePath)
                    }
                    console.log('Done...')
                    resolve()
                } catch (error) {
                    console.error('Upload error:', error)
                    reject(error)
                }
            })
        })
    } catch (error) {
        console.error('Script error:', error)
        throw error
    }
}

init().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})