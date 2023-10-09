const GSheetsParser = require("public-google-sheets-parser");

const spreadSheetId = "1eJE3m5skQIszcc0R7KgTyNy6VHEcs_z12oQdGRRwlr4";

const parser = new GSheetsParser(spreadSheetId);

async function getLessonsForDay(currentDate){

	text = await fetch(`https://docs.google.com/spreadsheets/d/${spreadSheetId}/`).then(res => res.text());
	// const currentDate = new Date(); // Текущая дата
	// currentDate.setDate(currentDate.getDate() + (currentDate.getDay() == 0 ? 1 : 0));
	// console.log(currentDate);

	// Регулярное выражение для поиска строк с заданным форматом
	const regex = /\d{2}\.\d{2} - \d{2}\.\d{2} \(\d+-я неделя\)/g;

	// Используем метод match() для поиска строк, соответствующих формату
	const matches = text.match(regex);

	if (matches) {
		// console.log(matches);
		// Ищем строку, в пределах даты которой находится текущая дата
		let matchedString = null;
		for (const match of matches) {
			const dateRange = match.match(/\d{2}\.\d{2} - \d{2}\.\d{2}/)[0];
			const [startDateStr, endDateStr] = dateRange.split(' - ');
			// Разбиваем строку на компоненты даты
			const startDateComponents = startDateStr.split('.');
			const endDateComponents = endDateStr.split('.');

			// Создаем объекты Date на основе компонентов даты
			const startDate = new Date(+currentDate.getFullYear(), startDateComponents[1]-1, +startDateComponents[0]);
			const endDate = new Date(+currentDate.getFullYear(), endDateComponents[1]-1, +endDateComponents[0]);
			
			if (currentDate >= startDate && currentDate <= endDate) {
				matchedString = match;
				break; // Выходим из цикла, когда находим подходящую строку
			}
		}
		if (matchedString){
			return matchedString;
		} 
		else {
			return undefined;
		}
	}
	else {
		return undefined;
	}
	
}

module.exports = async function parseSheet() {
	for_date = new Date();
	for_date.setDate(for_date.getDate() + (for_date.getDay() === 0 ? 1 : 0));
	sheet_name = await getLessonsForDay(for_date);
	// console.log(sheet_name);
	psd = await parser.parse(spreadSheetId, sheet_name).then(async items => {
		// console.log(items);
		// console.log("\n\n\n\n");
		let weekday = "";
		processed_sheet = [];
		current_object = null;
		for(let item of items){
			if (item["проект готов  День недели "] !== undefined){
				// console.log("ДЕНЬ НЕДЕЛИ: " + item["проект готов  День недели "] + "\n");
					
				if(current_object !== null){
					processed_sheet.push(current_object);
				}
				current_object = {
					weekday: item["проект готов  День недели "],
					lessons: []
				};
			}
			if(item["КОМПЬЮТЕРНАЯ БЕЗОПАСНОСТЬ Группа 5"]){
				current_object.lessons.push({
					time: item["Время занятий "],
					lesson: item["КОМПЬЮТЕРНАЯ БЕЗОПАСНОСТЬ Группа 5"]
				});
			}
			// console.log("пара " + item["Пара "] + ": \n");
			// console.log(item["КОМПЬЮТЕРНАЯ БЕЗОПАСНОСТЬ Группа 5"]);
			// console.log("\n\n");
		}
		processed_sheet.push(current_object); // for Saturday
		console.log(processed_sheet);
		return processed_sheet;
	})

	return psd
};

