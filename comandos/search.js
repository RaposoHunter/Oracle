const puppeteer = require("puppeteer");
const https = require("https");
const fs = require("fs");

module.exports = {
	name: "search",
	description: `search: Envia a primeira imagem encontrada sobre o que foi para o comando.

	Para usar o comando basta informar, além do prefixo '-o' e do comando 'search', o que você quer pesquisar.
	Ex.: "-o search discord" retorna uma imagem relacionada ao Discord!`,
	usage: "-s search <pesquisa>",
	execute: (msg, args) => {
		args[0] = args.join(" ");

		if(!args[0].length) return msg.channel.send("Você esqueceu de dizer o que queria pesquisar...");

		msg.channel.send(`Procurarei pela primeira imagem sobre "${args[0]}". Aguarde...`)

		/*const download = (url, imgName) => new Promise((resolve, reject) => {
			const file_path = `./imagens/${imgName}.png`;
			const file = fs.createWriteStream(file_path);

			https.get(url, res => {
				res.pipe(file);

				file.on("finish", () => {
					file.close(resolve(true));
				});

				file.on("error", err => {
					console.log(err);
					fs.unlink(file_path, () => {});
					reject(err.msg);
				})
			}).on("error", err => {
				console.log(err);
				fs.unlink(file_path, () => {});
				reject(err.msg);
			});
		});*/

		// Existem duas versões da função 'sendToDiscor'. Uma onde você envia um arquivo e outra onde você envia o link.
		// Por questões de otimização, a segunda será a usada nesse caso, mas a primeira continuará mencionada por motivos históricos  

		// Versão 1:

		/*const sendToDiscord = async (filePath, fileDescription) => {
			msg.channel.bulkDelete(1, true).catch(err => {
				console.log(err);
			});

			await msg.channel.send(fileDescription, {files: [filePath]});
			fs.unlink(filePath, () => {});
		}*/

		// Versão 2:

		const sendToDiscord = async (imgURL, imgDescription) => {
			await msg.channel.bulkDelete(1, true).catch(err => {
				console.log(err);
			});

			await msg.channel.send(imgDescription);
			await msg.channel.send(imgURL);
		}

		// 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' // Rodar com Google Chrome
		(async () => {
			// Cria as variáveis do navegador e da página;
			const browser = await puppeteer.launch({headless: false});
			const page = await browser.newPage();

			// Pesquisa pelo que foi enviado ao bot e espera o termino da execução da função
			await page.goto("https://www.google.com/search?q=" + args[0]);

			// Recupera o botão de imagens dentre todos os outros
			let btn_href = await page.$$eval("a.q.qs", els => {
				let href;

				els.forEach((el, i) => {
					if(el.innerText == "Imagens") href = el.href
				})

				return href || null;
			});

			if(btn_href != null) {
				// Navega até a página das imagens e, logo em seguida, clica na primeira
				await page.goto(btn_href)
				await page.click(".rg_i.Q4LuWd");
				
				// Espera até que a imagem seja renderizada completamente no navegador
				let rendered_img = page.waitForFunction("document.querySelector('img.n3VNCb').src.slice(0, 4) != 'data'", {});
				await rendered_img;

				// Recupera o URL da imagem e sua descrição
				let [img_href, img_alt] = await page.evaluate((sel) => {
					let img = document.querySelector(sel);
					let source = img.getAttribute('src');
					let alt = img.getAttribute('alt');
					//let link = source.replace("/", "");

					return [source, alt];
				}, "img.n3VNCb");
				
				/*
				let img_path = `./imagens/${args[0]}.png`
				await download(img_href, img_path)
				await sendToDiscord(img_path, img_alt);
				*/

				// Envia os dados para o Discord
				await sendToDiscord(img_href, img_alt);
			}

			// Fecha o navegador
			await browser.close();
		})();
	}
}