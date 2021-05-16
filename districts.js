const axios = require("axios");
const {promisify} = require("util");
const chalk = require("chalk");
const beep = require("beepbeep");

const sleep = promisify(setTimeout);

axios.defaults.headers.common["origin"] = "https://www.cowin.gov.in";
// axios.defaults.headers.common[":authority:"] = "cdn-api.co-vin.in";
axios.defaults.headers.common["user-agent"] =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36";
axios.defaults.headers.common["referer"] = "https://www.cowin.gov.in/home";

async function getSlots(district, date) {
  let url = new URL("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict");
  url.searchParams.append("district_id", district);
  url.searchParams.append("date", date);

  try {
    let resp = await axios.get(url.toString());
    return resp.data;
  } catch (err) {
    throw err;
  }
}

(async () => {
  while (1) {
    let districts = [276, 265, 294];
    for (let district of districts) {
      let dates = ["13-05-2021"];
      for (let date of dates) {
        await sleep(Math.random() * 2000 + 2000);
        try {
          let resp = await getSlots(district, date);
          for (let center of resp.centers) {
            for (let session of center.sessions) {
              if (session.available_capacity > 0 && session.min_age_limit < 45) {
                beep(1);
                console.log("----------------------------------");
                console.log();
                console.log();
                console.log(chalk.bold.blue("Pincode:"), center.pincode);
                console.log(chalk.bold.blue("Center:"), center.name);
                console.log(chalk.bold.blue("Date:"), date);
                console.log(chalk.bold.blue("Minimum age limit:"), session.min_age_limit);
                console.log(chalk.bold.red(session.available_capacity), "slots available");
                console.log("Session", session);
                console.log();
                console.log();
                console.log("----------------------------------");
              }
            }
          }
        } catch (err) {
          console.log("Failed to fetch");
        }
      }
    }
  }
})();
