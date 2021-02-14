const {Command, flags} = require('@oclif/command')
const YAML = require('yaml')
const fs = require('fs')
const marked = require("marked");
const { brotliDecompressSync } = require('zlib');

var all_topics = [];
var config = [];

var input_dir = '';
var output_dir = '';

const format_title = (s) => {
	if (typeof s !== 'string') return ''
	return s.charAt(0).toUpperCase() + s.slice(1)
  }

function createHead(name) {
	
	var head = `
	<head>
		<title>${format_title(name)} - ${config.site.title}</title>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/skeleton/2.0.4/skeleton.min.css" integrity="sha512-EZLkOqwILORob+p0BXZc+Vm3RgJBOe1Iq/0fiI7r/wJgzOFZMlsqTa29UEl6v6U6gsV4uIpsNZoV32YZqrCRCQ==" crossorigin="anonymous" />
		<link rel="stylesheet" href="${output_dir}/css/custom.css">
	</head>
	`;
	return head;
}

function createHeader(name) {
	var header = `
	<body>
	<div class="container">
		<h1>${config.site.title}</h1>
		<h4>${config.site.description}</h4>
		<hr>
	</div>
	`
	return header;
}

function createFooter(name) {
	var footer = `
	<div class="container">
		<hr>
		<p>Generated by <a href="https://github.com/tehp/maggie">maggie</a>, the open source git based wiki generator!</p>
	</div>
	</body>
	`
	return footer;
}

function createSidebar(name) {
	var pages = '';
	for (page in config.site.sidebar_pages) {
		page_name = config.site.sidebar_pages[page];
		pages += `<li><a href="${page_name}.html">${format_title(page_name)}</a></li>`
	}
	var sidebar = `
	${config.site.motd}
	<hr>
	<h6>Important pages:</h6>
	<ul>${pages}</ul>
	`
	return sidebar;
}

function parseContent(name) {
	var markdown = fs.readFileSync(input_dir + '/content/' + name + '.md').toString();
	var html = marked(markdown);
	return '<h2>' + format_title(name) + '</h2>' + html;
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

	filename = filename.slice(0, -4);
	filename += "html";

	var sidebar_and_content = `
	<div class="container">
		<div class="row">
			<div class="one-third column">${createSidebar(name)}</div>
			<div class="two-thirds column">${parseContent(name)}</div>
		</div>
	</div>
	`

	var html = createHead(name) + createHeader(name) + sidebar_and_content + createFooter(name);

	fs.writeFileSync(filename, html);
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

		if (!fs.existsSync(output_dir + '/css')){
			fs.mkdirSync(output_dir + '/css');
		}

		fs.writeFile(output_dir + '/css/custom.css', '', () => {});

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
