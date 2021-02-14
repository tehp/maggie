const {Command, flags} = require('@oclif/command')
const YAML = require('yaml')
const fs = require('fs')
const marked = require("marked")

var all_topics = [];
var config = [];

var input_dir = '';
var output_dir = '';

function createHead(name) {
	
	var head = `
	<head>
		<title>${name} - ${config.site.title}</title>
	</head>
	`;
	return head;
}

function parseContent(name) {
	var markdown = fs.readFileSync(input_dir + '/content/' + name + '.md').toString();
	console.log(markdown);
	var html = marked(markdown);
	return html;
}

function createFile(name) {
	// Remove file extension
	name = name.slice(0, -3);

	console.log('     ------     ');
	console.log('Creating page: ' + name);

	var filename = output_dir + '/' + name + '.html';

	// if (fs.existsSync(filename)){
	// 	fs.rmSync(filename);
	// 	console.log('Deleting old version of file: ' + filename);
	// }

	var content = parseContent(name);
	filename = filename.slice(0, -4);
	filename += "html";

	// Add head
	content = createHead(name) + content;

	fs.writeFileSync(filename, content);
}

function scanFiles(path) {
	var topics = [];
	fs.readdir(path + '/content', (err, files) => {
	  files.forEach(file => {
		topics.push(file);
	    createFile(file);
	  });
	  all_topics = topics;
	});
}

class MaggieCommand extends Command {
  async run() {
    const {flags} = this.parse(MaggieCommand)

	if (flags.build) {
		console.log('[maggie] Starting build...');
		input_dir = process.cwd() + '/' + flags.input;
		console.log('Input directory: ' + input_dir);
	
		output_dir = input_dir + '/dist';

		console.log('Output directory: ' + output_dir);

		if (!fs.existsSync(output_dir)){
		    fs.mkdirSync(output_dir);
		}

		const file = fs.readFileSync(input_dir + '/' + 'config.yml', 'utf8');
		config = YAML.parse(file);
		config.input_dir = input_dir;

		console.log(config);

		scanFiles(config.input_dir);
	}
  }
}

MaggieCommand.description = `maggie: git based wiki generator
If you need help with maggie visit https://github.com/tehp/maggie
`

MaggieCommand.flags = {
  version: flags.version({char: 'v'}),
  help: flags.help({char: 'h'}),
  build: flags.boolean({char: 'b', description: 'build', default: true}),
  input: flags.string({char: 'i', description: 'source directory', default: ''}),
}

module.exports = MaggieCommand
