const fs = require("fs");
const Discord = require("discord.js"); // apesar de ser um módulo e não precisar do '.js', o nome do módulo é 'discord.js'

//const client = require("../initializeBot.js");

const {prefix, token} = require("./config.json")

const client = new Discord.Client();
client.commands = new Discord.Collection();

let commandFiles = fs.readdirSync("./comandos").filter((file) => file.endsWith(".js"));

for(let file of commandFiles) {
	let command = require(`./comandos/${file}`);

	client.commands.set(command.name, command);
}

client.once("ready", () => {
	console.log("Pronto!");
});

client.on("message", (msg) => {
	// Se a mensagem enviada não possuir o prefixo ou tiver sido
	// enviada por um bot o processo é encerrado prematuramente.
	if(!msg.content.startsWith(prefix) || msg.author.bot) return;

	// args recebe todo o texto após o prefixo, elimina os espaços vazios externo e divide o texto em pedaços
	// separados por espaços vazios (sem considerar múltiplos espaços vazios) e guarda cada pedaço no array;
	const args = msg.content.slice(prefix.length).trim().split(/ +/); // EX.: -s say    Hello ... args = ["say", "hello"];

	// Como args[0] tem que ser necessariamente um comando, entao command recebe o valor presente em args[0]
	// enquanto, ao mesmo tempo, remove o valor de dentro do array. EX.: args = ["hello"]; command = "say". 
	const cmd = args.shift().toLowerCase();

	if(cmd === "help") {
		return msg.channel.send(client.commands.map(cmd => cmd.description).join("\n"))
	}

	// Caso não exista o comando digitado o programa encerra prematuramente e notifica o usuário.
	if(!client.commands.has(cmd)) return msg.reply(`Desculpe, não conheço esse comando... Use "${prefix} help" para uma explicação!`);

	// Tenta executar o comando enviado com seus devidos argumentos.
	try {
		client.commands.get(cmd).execute(msg, args);
	} catch(e) {
		console.log(e);
		msg.reply("Algo deu errado na execução do comando...");
	}
});

// Realiza o login do bot no servidor
client.login(token);


