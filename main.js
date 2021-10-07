const puppeteer = require('puppeteer');
const pdfkit = require("pdfkit");
const fs = require("fs");
console.log("Before");
(async function(){
    try{
  const BrowserOpen = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args : ["--start-maximized"]
  });

  const Pages = await BrowserOpen.pages();
  const page = Pages[0];
  await page.goto("https://www.youtube.com/playlist?list=PLRBp0Fe2GpglTnOLbhyrHAVaWsCIEX53Y");
  await page.waitForSelector('h1#title');
  let name = await page.evaluate(function(selector){
    return document.querySelector(selector).innerText
  },"h1#title");
  console.log(name);
  const reqd_info = await page.evaluate(get_info,'#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer');
  console.log(reqd_info.videos_count," ",reqd_info.views_count);
  let total_videos = reqd_info.videos_count.split(' ')[0];
//   console.log(total_videos);
  let page_scope_videos = await videos_covered(page);
//   console.log(page_scope_videos);
  while(total_videos-page_scope_videos>20)
  {
      await scrolltoBottom(page);
      page_scope_videos = await videos_covered(page);
    //   total_videos-=page_scope_videos;
  
  }
  console.log(0);
  let get_list = await resultList(page);
//  console.log(get_list.length);
//  console.log(get_list);
 let pdf = new pdfkit();
 pdf.pipe(fs.createWriteStream('playlist.pdf'));
 pdf.text(JSON.stringify(get_list));
 pdf.end();
}
catch(error){
    // console.log(error);
}
})();
function get_info(selector)
{
    const ElemsArr = document.querySelectorAll(selector);  
    const videos_count =   ElemsArr[0].innerText;
    const views_count = ElemsArr[1].innerText;
    return {
        videos_count, views_count
    }
}

async function videos_covered(page)
{
    let count_videos_covered = await page.evaluate(function (selector)
    {
        let videos_scope_arr = document.querySelectorAll(selector);
        return videos_scope_arr.length; 
    }, '.playlist-drag-handle.style-scope.ytd-playlist-video-renderer');
    return count_videos_covered;
}


async function scrolltoBottom(page){
    await page.evaluate(function(){
        window.scrollBy(0 , window.innerHeight);
    })
}
async function resultList(page){
    let list = page.evaluate(getStats, "#video-title" , "#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
    return list;
}

function  getStats(nameselector,durationselector){
    let video_name_arr = document.querySelectorAll(nameselector);
    let video_duration_arr = document.querySelectorAll(durationselector);
    console.log(video_name_arr.length);
    let list_arr = [];
    for(let i=0;i<video_name_arr.length;i++)
    {   let video_name = video_name_arr[i].innerText;
        let video_duration = video_duration_arr[i].innerText;
        list_arr.push({ video_name ,  video_duration });
    }
    // console.log(list_arr.length);
    return list_arr;
}
console.log("After");