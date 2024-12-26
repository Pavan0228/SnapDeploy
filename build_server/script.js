const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')
const Redis = require('ioredis')
require('dotenv').config({
    path: path.join(__dirname, '.env')
})

const publisher = new Redis(process.env.REDIS_URL)

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const PROJECT_ID = process.env.PROJECT_ID

function publishMessage(log) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify({ log }))
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
        publishMessage(`Created directory: ${dirPath}`)
    }
}

async function init() {
    try {
        publishMessage('Build process initiated')
        console.log('Executing script.js')
        console.log('Build Started...')
        
        const outDirPath = path.join(__dirname, 'output')
        ensureDirectoryExists(outDirPath)

        return new Promise((resolve, reject) => {
            publishMessage('Starting npm install and build')
            const p = exec(`cd ${outDirPath} && npm install && npm run build`)

            p.stdout.on('data', function (data) {
                const message = data.toString().trim()
                console.log(message)
                publishMessage(`Build output: ${message}`)
            })

            p.stderr.on('data', function (data) {
                const error = data.toString().trim()
                console.error('Error:', error)
                publishMessage(`Build error: ${error}`)
            })

            p.on('error', function (error) {
                console.error('Process error:', error)
                publishMessage(`Process error: ${error.message}`)
                reject(error)
            })

            p.on('close', async function (code) {
                if (code !== 0) {
                    const error = new Error(`Build process exited with code ${code}`)
                    console.error(error.message)
                    publishMessage(`Build failed with exit code ${code}`)
                    return reject(error)
                }

                publishMessage('Build completed successfully')
                console.log('Build Complete')

                try {
                    const distFolderPath = path.join(__dirname, 'output', 'dist')
                    
                    // Check if dist folder exists after build
                    if (!fs.existsSync(distFolderPath)) {
                        const error = new Error('Dist folder not found after build')
                        throw error
                    }

                    const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })

                    console.log('Starting to upload')
                    publishMessage('Beginning upload process')

                    for (const file of distFolderContents) {
                        const filePath = path.join(distFolderPath, file)
                        if (fs.lstatSync(filePath).isDirectory()) {
                            publishMessage(`Skipping directory: ${file}`)
                            continue;
                        }

                        console.log('uploading', filePath)
                        publishMessage(`Uploading file: ${file}`)

                        const s3Key = `__outputs/${PROJECT_ID}/${file}`
                        const command = new PutObjectCommand({
                            Bucket: process.env.AWS_BUCKET_NAME,
                            Key: s3Key,
                            Body: fs.createReadStream(filePath),
                            ContentType: mime.lookup(filePath)
                        })

                        await s3Client.send(command)
                        console.log('uploaded', filePath)
                        publishMessage(`Successfully uploaded: ${file} to ${s3Key}`)
                    }
                    
                    console.log('Done...')
                    publishMessage('Upload process completed successfully')
                    resolve()
                } catch (error) {
                    console.error('Upload error:', error)
                    publishMessage(`Upload process failed: ${error.message}`)
                    reject(error)
                }
            })
        })
    } catch (error) {
        console.error('Script error:', error)
        publishMessage(`Fatal script error: ${error.message}`)
        throw error
    }
}

init().catch(error => {
    console.error('Fatal error:', error)
    publishMessage(`Script terminated with error: ${error.message}`)
    process.exit(1)
})