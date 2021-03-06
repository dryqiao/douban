import {
  pagesToArray,
  getNumFromString,
  getDateFromString,
  mapLimit
} from './utils'
import store from '../store'
import { getDom } from './crawler'
const COUNT_15 = 15
const SAW_COLUMN = [
  { header: '专辑', key: 'music', width: 32 },
  { header: '表演者', key: 'author', width: 16 },
  { header: '链接', key: 'link', width: 46 },
  { header: '简评', key: 'comment', width: 10 },
  { header: '评分', key: 'rank', width: 10 },
  { header: '日期', key: 'date', width: 10 }
]
const WISH_COLUMN = [
  { header: '专辑', key: 'music', width: 32 },
  { header: '表演者', key: 'author', width: 16 },
  { header: '链接', key: 'link', width: 46 },
  { header: '日期', key: 'date', width: 10 }
]
/**
 *获取已听音乐
 * @param {String} url
 * @param {Number} id
 * @returns {Array}
 */
export async function getSaw(id) {
  let pages = pagesToArray(store.state.base.music.collect, COUNT_15)
  return await mapLimit(pages, async (page, callback) => {
    let url = `https://music.douban.com/people/${id}/collect?start=${page}&sort=time&rating=all&filter=all&mode=grid`
    getDom(url).then($ => {
      let _arr = []
      $('.grid-view .item .info').each((_, item) => {
        _arr.push({
          music: $(item)
            .find('.title a em')
            .text(),
          author: $(item)
            .find('.intro')
            .text()
            .split('/')[0]
            .trim(),
          link: $(item)
            .find('.title a')
            .attr('href'),
          comment: $(item)
            .find('li')
            .eq(3)
            .text()
            .trim(),
          rank: getNumFromString(
            $(item)
              .find('li')
              .eq(2)
              .find(':first-child')
              .attr('class')
          ),
          date: getDateFromString(
            $(item)
              .find('.date')
              .text()
          )
        })
      })
      callback(null, _arr)
    })
  })
}
/**
 *获取想听音乐
 * @param {String} url
 * @param {Number} id
 * @returns {Array}
 */
async function getWish(id) {
  let pages = pagesToArray(store.state.base.book.wish, COUNT_15)
  return await mapLimit(pages, async (page, callback) => {
    let url = `https://music.douban.com/people/${id}/wish?start=${page}&sort=time&rating=all&filter=all&mode=grid`
    getDom(url).then($ => {
      let _arr = []
      $('.grid-view .item .info').each((_, item) => {
        _arr.push({
          music: $(item)
            .find('.title a em')
            .text(),
          author: $(item)
            .find('.intro')
            .text()
            .split('/')[0]
            .trim(),
          link: $(item)
            .find('.title a')
            .attr('href'),
          date: getDateFromString(
            $(item)
              .find('.date')
              .text()
          )
        })
      })
      callback(null, _arr)
    })
  })
}

/**
 * @param {Number} id
 * @returns {Array}
 */
export const getMusics = async id => {
  return [await getSaw(id), await getWish(id)]
}
/**
 * 音乐数据写入excel
 * @param {Number} id
 * @param {*} workbook
 */
export const musicToExcel = async (id, workbook) => {
  let [saw, wish] = await getMusics(id)
  let sheetSaw = workbook.addWorksheet('音乐-已听'),
    sheetWish = workbook.addWorksheet('音乐-想听')
  sheetSaw.columns = SAW_COLUMN
  sheetWish.columns = WISH_COLUMN

  sheetSaw.addRows(saw)
  sheetWish.addRows(wish)
}
