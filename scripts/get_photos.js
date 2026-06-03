// scripts/get_photos.js

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const JSON_FILE = path.join(
  __dirname,
  '..',
  'assets',
  'data',
  'member-photos.json'
)

const OUTPUT_DIR = path.join(
  __dirname,
  '..',
  'public',
  'members'
)

if (!fs.existsSync(JSON_FILE)) {
  console.error(`JSON file not found: ${JSON_FILE}`)
  process.exit(1)
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const data = JSON.parse(
  fs.readFileSync(JSON_FILE, 'utf8')
)

for (const image of data.images) {
  const { member_id, photo_url } = image

  if (!member_id || !photo_url) {
    console.warn('Skipping invalid record')
    continue
  }

  const filename = `${member_id}.jpg`
  const outputFile = path.join(
    OUTPUT_DIR,
    filename
  )

  console.log(`Downloading ${member_id}...`)

  try {
    execSync(
      `wget -q -O "${outputFile}" "${photo_url}"`,
      {
        stdio: 'inherit'
      }
    )

    console.log(`✓ ${filename}`)
  } catch (err) {
    console.error(`✗ Failed: ${member_id}`)
  }
}