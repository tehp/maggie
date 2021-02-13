const {Command, flags} = require('@oclif/command')
const YAML = require('yaml')
const fs = require('fs')

function createPage(name) {
	console.log('Creating page: ' + name);
}

function scanFiles(path) {
	fs.readdir(path + '/content', (err, files) => {
	  files.forEach(file => {
	    createPage(file);
	  });
	});
}

class MaggieCommand extends Command {
  async run() {
    const {flags} = this.parse(MaggieCommand)

	if (flags.build) {
		console.log('[maggie] Starting build...');
		var input_dir = process.cwd() + '/' + flags.input;
		console.log('Input directory: ' + input_dir);
	
		var output_dir = input_dir + '/dist';

		console.log('Output directory: ' + output_dir);

		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir);
		}

		const file = fs.readFileSync(input_dir + '/' + 'config.yml', 'utf8');
		var config = YAML.parse(file);
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
