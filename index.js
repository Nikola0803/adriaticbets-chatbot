"use strict";

require("dotenv").load();

const BootBot = require("bootbot"),
		axios = require("axios"),
		moment = require("moment"),
		cheerio = require("cheerio");

//If this const is set to false, it will let users input in the chat, if its set to true,
//the users can only use buttons in the chat window to communicate with the bot
const disableInput = false;


const getTipsToday = async () => {
	const response = await axios.get("http://adriaticbets.com");

	const $ = cheerio.load(response.data);

	const tipovi = $(".category-tipovi")
		.map((i, el) => {
			const $ = cheerio.load(el);
			// console.log($.html());
			const title = $('.entry-title > a').text();
			const link = $('.entry-title > a').attr('href');
			const published = $('span.published').text();

			// console.log("QUERRY MAP: \n" + title + "\n" + link + "\n" + published);

			return { title: title, link: link, published: published };
		})
		.get()
		.filter((tip) => {
		// console.log(tip);
		// console.log(moment(tip.published, "MMM D, YYYY").isSame(moment(), 'day'));
		return moment(tip.published, "MMM D, YYYY").isSame(moment(), 'day');
	});

	console.log(tipovi);

	// console.log("GET_TIPS_TODAY: " + tipovi);
	return tipovi;
}

const bot = new BootBot({
	accessToken: process.env.FB_ACCESS_TOKEN,
	verifyToken: process.env.FB_VERIFY_TOKEN,
	appSecret: process.env.FB_APP_SECRET
});

bot.start(process.env.PORT);

bot.on("message", (payload, chat, data) => {
	if (!data.captured) {
		chat.say(`Echo: ${payload.message.text}`);
	}
});

bot.hear("/pomoc", (payload, chat) => {
	chat.say('Za sve informacije kontaktirajte admina. ');
});

bot.setGreetingText('Zdravo! Dobrodosli u ADRIATICBETS! Kliknite ispot kako bi pokrenuli Razgovor');

bot.setGetStartedButton((payload, chat) => {
	chat.say({
		text: 'Zdravo! Kako vam Danas mogu pomoci?',
		buttons: [
			{ type: 'postback', title: 'Danasnji Tipovi', payload: 'HELP_TIPOVI' },
			{ type: 'postback', title: 'Kladionice', payload: 'HELP_KLADIONICE' },
			{ type: 'postback', title: 'Bonusi za Kladjenje', payload: 'HELP_BONUS' },
    ],
  });
});

bot.hear("/tipovi", async (payload, chat) => {
	const tipovi = await getTipsToday();
	if (tipovi.length) {
		tipovi.map(tip => {
			chat.say(
				`${tip.title}\n${tip.link}\n${tip.published}`
			)
			setTimeout(() => { }, 50);
		})
	} else {
		chat.say("Nema tipova za danas!");
	}

});

bot.on('postback:HELP_TIPOVI', async (payload, chat) => {

	const tipovi = await getTipsToday();
	if (tipovi.length) {
		chat.say('Danasnji Tipovi Su:');

		setTimeout(() => {

		}, 500);

		tipovi.map(tip => {
			chat.say(
				`${tip.title}\n${tip.link}\n${tip.published}`
			)
			setTimeout(() => { }, 100);
		})
	} else {
		chat.say("Nema tipova za danas!");
	}
});

bot.on('postback:HELP_KLADIONICE', (payload, chat) => {
	chat.say({
		text: 'Ponuda kladionica sa nasim Bonusima',
		buttons: [
			{ type: 'postback', title: 'BETHARD', payload: 'KLADIONICA_JEDAN' },
			{ type: 'postback', title: 'HALKBET', payload: 'KLADIONICA_DVA' },
			{ type: 'postback', title: 'ROYRICHIE', payload: 'KLADIONICA_TRI' },
    ],
  });
});
bot.on('postback:KLADIONICA_JEDAN', (payload, chat)=>{
	chat.say('http://adriaticbets.com/bethard');
});
bot.on('postback:KLADIONICA_DVA', (payload, chat)=>{
	chat.say('http://adriaticbets.com/halkbet'),
	chat.say({
		attachment: 'image',
		url: 'https://adriaticbets.com/wp-content/uploads/2018/05/download-1.png'}),
	chat.say('Halkbet vam nudi 100% bonusa na maksimalnu uplatu od 100 Eura')
});
	
bot.on('postback:KLADIONICA_TRI', (payload, chat)=>{
	chat.say('http://adriaticbets.com/royrichie');
});

bot.on('postback:HELP_BONUS', (payload, chat) => {
	chat.say('Ukoliko zelite da ostvarite bonus, potrebno je da izeberete jednu od kladionica sa kojom imamo ostvarenu saradnju. Koristeci Link sa naseg sajta ili iz chat-a ostvarujete registracioni registracioni bonus u zavisnosti od uplate. Minimalni ulog prilikom registracije je 50 eura');
});

bot.setPersistentMenu([
	{
	  title: 'Kontaktiraj Admina',
		  type: 'postback',
		  payload: 'HISTORY_ADMIN'    
	},
	{
	  title: 'Idi na Sajt',
	  type: 'web_url',
	  url: 'http://adriaticbets.com'
	},
	{
		title: 'Saradnja',
		type: 'web_url',
		url: 'http://adriaticbets.com/saradnja'
	  }
  ], disableInput);

  bot.on('message', (payload, chat) => {
	const text = payload.message.text;
	const userId = payload.sender.id;
	bot.say('Hello World', userId);
  });
  
bot.hear(['cao', 'zdravo'], (payload, chat) => {
	chat.say({
		text: 'Zdravo! Kako vam danas mogu pomoci?',
		quickReplies: ['Tipovi', 'Bonusi', 'Saradnja', 'VIP Grupa']
	});
});

bot.hear('Tipovi', async (payload, chat) => {
	const tipovi = await getTipsToday();
	if (tipovi.length) {
		tipovi.map(tip => {
			chat.say(
				`${tip.title}\n${tip.link}\n${tip.published}`
			)
			setTimeout(() => { }, 50);
		})
	} else {
		chat.say("Nema tipova za danas!");
	}

});

bot.hear('Bonusi', (payload, chat) => {
	chat.say('Ukoliko zelite da ostvarite bonus, potrebno je da izeberete jednu od kladionica sa kojom imamo ostvarenu saradnju. Koristeci Link sa naseg sajta ili iz chat-a ostvarujete registracioni registracioni bonus u zavisnosti od uplate. Minimalni ulog prilikom registracije je 50 eura');
});

bot.hear('Saradnja', (payload, chat) => {
	chat.say('Ukoliko ste zainteresovani za saradanju, kontaktirajte jednog od nasih administratora');
});

bot.hear('VIP GRUPA', (payload, chat) => {
	chat.say('Ukoliko zelite da se prikljucite nasoj VIP GRUPI u kojoj je procenat izlaznosti 10 od 10, potrebno je da uradite 3 stvari.').then(() => {
		chat.say('1) Registrujete se na neku od kladionica iz nase ponude.').then(() => {
			chat.say('2) Dodate Depozit od minimum 50 eura na vas novi nalog.').then(() => {
				chat.say('3) Screenshotujete ID Broj i Depozit i prosledite nasem administratoru.').then(() => {
					chat.say('Nakon provere, administratori ce vas dodati u VIP GRUPU. SRECNO U NOVE POBEDE!')
				})
			})
		})
	})
});
