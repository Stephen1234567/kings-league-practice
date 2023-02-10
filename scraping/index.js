import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const URLS = {
  leaderBoards: 'https://kingsleague.pro/estadisticas/clasificacion/'
}

async function scrape (url) {
  const res = await fetch(URLS.leaderBoards)
  const html = await res.text()

  return cheerio.load(html)
}

async function getLeaderBoard () {
  const $ = await scrape(URLS.leaderBoards)
  const $rows = $('table tbody tr')

  const LEADERBOARD_SELECTORS = {
    team: { selector: '.fs-table-text_3', typeOf: 'string' },
    wins: { selector: '.fs-table-text_4', typeOf: 'number' },
    loses: { selector: '.fs-table-text_5', typeOf: 'number' },
    scoredGoals: { selector: '.fs-table-text_6', typeOf: 'number' },
    concededGoals: { selector: '.fs-table-text_7', typeOf: 'number' },
    yellowCards: { selector: '.fs-table-text_8', typeOf: 'number' },
    redCards: { selector: '.fs-table-text_9', typeOf: 'number' }
  }

  const cleanText = text => text
    .replace(/\t|\n|\s:/g, '')
    .replace(/.*:/g, ' ')
    .trim()

  const leaderBoardsSelectorEntries = Object.entries(LEADERBOARD_SELECTORS)

  const leaderBoard = []
  $rows.each((index, el) => {
    const leaderBoardsEntries = leaderBoardsSelectorEntries.map(([key, { selector, typeOf }]) => {
      const rawValue = $(el).find(selector).text()
      const cleanValue = cleanText(rawValue)
      const value = typeOf === 'number' ? Number(cleanValue) : cleanValue

      return [key, value]
    })

    leaderBoard.push(Object.fromEntries(leaderBoardsEntries))
  })

  return leaderBoard
}

const leaderBoard = await getLeaderBoard()
const filePath = path.join(process.cwd(), './db/leaderboard.json')

await writeFile(filePath, JSON.stringify(leaderBoard, null, 2), 'utf-8')
