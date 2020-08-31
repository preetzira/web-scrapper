const puppeteer = require('puppeteer')
const fs = require("fs")
const { clear } = require('console')
const url = 'https://www.flight-mechanic.com/how-to-become-an-aircraft-mechanic/amt-schools/'

console.time('time elapsed')
let browser, page, fileContent, records = [], titles
!(async () => {
    try {
        console.log('\nLoading page')
        const intervalId = setInterval(() => {
            process.stdout.write('.')
        }, 100)
        browser = await puppeteer.launch({ headless: true })
        page = await browser.newPage()
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        console.log('\nPage loaded\n\nScrapping started')
        const records = await page.$eval('body', body => {
            const elems = [...body.querySelectorAll('.su-spoiler')]
            const records = ["Region, School/Collage/University, Website, Street, Address, Phone Number"]
            elems.forEach(elem => {
                let record = [], scuCounter = 0, webCounter = 0
                const Region = elem.querySelector('.su-spoiler-title').innerText
                const scu = [...elem.querySelectorAll('.su-spoiler-content strong')].filter(e => Boolean(e.innerText.length > 1))
                const web = elem.querySelectorAll('.su-spoiler-content a')
                elem.querySelectorAll('.su-spoiler-content p').forEach(e => {
                    const result = e.innerText.split('\n')
                    if (result.length > 1) {
                        street = result[result.length - 3].replace(/,/, ' |')
                        address = result[result.length - 2].replace(/,/, ' |')
                        phone = result[result.length - 1].replace(/,/, ' |')
                        records.push(
                            `${Region}, ${scu[scuCounter].innerText.replace(/\n/, '')}, ${web[webCounter].innerText}, ${street}, ${address}, ${phone}`
                        )
                        if (scuCounter < scu.length - 1) scuCounter++
                        if (webCounter < web.length - 1) webCounter++
                    }
                })
            })
            return JSON.stringify(records)
        })
        const data = JSON.parse(records).join('\r\n')
        fs.writeFile('scraped.csv', data, 'ascii', async (err) => {
            if (err) console.log(err)
            clearInterval(intervalId)
            console.log('\nScrapping done\n')
            console.timeEnd('time elapsed')
	    await browser.close()
            process.exit(0)
        })
    } catch (error) {
        console.log(error)
    }
})()
