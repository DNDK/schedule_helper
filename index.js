const TelegramBot = require("node-telegram-bot-api");

const token = "6452394392:AAEBAfOtKRiLjZHJ_NTwnZomOSZ1qqFBgkM"

const bot = new TelegramBot(token, {polling: true});

const schedule = require("node-schedule");

const sched_parse = require("./parser.js");
const DAYS = require("./days");

const job = schedule.scheduleJob("0 23 * * 0-5", async () => {
	// 1030381043 - chat_id with me
	let chat_id = 1030381043;
	let sched = await sched_parse();
	let current_date = new Date();
	let weekday_code = current_date.getDay();

	let scd = sched.find(el => el.weekday.toLowerCase() === DAYS[weekday_code]);
	let answer = `*${scd["weekday"]}*\n`;
		for (let l of scd["lessons"]){
			answer += `*_${l["time"]}_*\n`;
			answer += `${l["lesson"]}\n\n`
		}
	bot.sendMessage(chat_id, answer, {parse_mode: "Markdown"});
});

bot.on('message', async (msg) => {
	try{
		console.log(msg.chat.id);
		let cmd = msg.text.toString().toLowerCase();
		let sched = await sched_parse();

		if(DAYS.includes(cmd)){
			bot.sendMessage(msg.chat.id, "Получаю информацию...");
			w_day = sched.find(el => el["weekday"].toLowerCase() === cmd);
			console.log(w_day);
			answer = `*${w_day["weekday"]}*\n`;
			for (let l of w_day["lessons"]){
				answer += `*_${l["time"]}_*\n`;
				answer += `${l["lesson"]}\n\n`
			}

			bot.sendMessage(msg.chat.id, answer, {parse_mode: "Markdown"});
		}

		else if(cmd == "завтра"){
			bot.sendMessage(msg.chat.id, "Получаю информацию...");
			let sched = await sched_parse();
			let current_date = new Date();
			let weekday_code = current_date.getDay();

			// if (weekday_code){
			// 	weekday_code = 0;
			// }

			let scd = sched.find(el => el.weekday.toLowerCase() === DAYS[weekday_code]);
			let answer = `*${scd.weekday}*\n`;
				for (let l of scd.lessons){
					answer += `*_${l.time}_*\n`;
					answer += `${l.lesson}\n\n`
				}
			bot.sendMessage(msg.chat.id, answer, {parse_mode: "Markdown"});
		}

		else if(cmd === "помощь"){
			help_text = "[день_недели] - получить расписание на указанный день недели\n";
			help_text += "завтра - получить расписание на следующий учебный день\n";
			help_text += "любой другой текст - всё расписание на неделю\n\n";
			help_text += "Все данные берутся из google-таблицы с расписанием.";
			bot.sendMessage(msg.chat.id, help_text);
		}

		else{
			bot.sendMessage(msg.chat.id, "Получаю информацию...");
			let answer_str = "";
			for(let s of sched){
				answer_str += `*${s["weekday"]}*\n`;
				for (let less of s["lessons"]){
					answer_str += `_${less["time"]}_\n`;
					answer_str += `${less["lesson"]}\n\n`;
				}
			}
			bot.sendMessage(msg.chat.id, answer_str, {parse_mode: "Markdown"});

		}
	}
	catch(err){
		bot.sendMessage(msg.chat.id, "случилась ошибка: " + err);
	}

})