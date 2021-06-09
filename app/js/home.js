//Modules
const open = require('open');

//Render Home Screen
async function Home() {
	let html = '';
	return new Promise((r) => {
		//Settings Icon

		//Search
		html += '<div class="projects-search">';
		html +=
			'<div class="projects-search-input-wrapper"><svg xmlns="http://www.w3.org/2000/svg" width="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>';
		html += '<input type="text" spellcheck="false" placeholder="Search...">';
		html +=
			'<svg class="projects-search-reset hidden" width="13" height="13" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.4608 0.539168C18.1797 1.25806 18.1797 2.42361 17.4608 3.1425L11.6033 9L17.4608 14.8575C18.1797 15.5764 18.1797 16.7419 17.4608 17.4608C16.7419 18.1797 15.5764 18.1797 14.8575 17.4608L9 11.6033L3.1425 17.4608C2.42361 18.1797 1.25806 18.1797 0.539167 17.4608C-0.179723 16.7419 -0.179722 15.5764 0.539168 14.8575L6.39667 9L0.539168 3.1425C-0.179722 2.42361 -0.179723 1.25806 0.539167 0.539169C1.25806 -0.179722 2.42361 -0.179722 3.1425 0.539169L9 6.39667L14.8575 0.539168C15.5764 -0.179723 16.7419 -0.179723 17.4608 0.539168Z"/></svg></div>';
		html +=
			'<svg class="settings" xmlns="http://www.w3.org/2000/svg" width="26" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
		html += '</div>';

		//Projects List Screen
		html += '<div class="projects">';

		//Projects
		html += renderProjects(projects);

		//End Projects
		html += '</div>';
		let projectName = projects.length > 1 ? 'Projects' : 'Project';
		html += '<footer><a href="#" class="addProject" draggable="false">New Project</a><span>' + projects.length + ' ' + projectName + '</span></footer>';

		//Resolve
		r(html);
	});
}

//Render Projects
function renderProjects(projects) {
	let html = '';

	//Loop Projects
	projects.forEach((project) => {
		html += '<div class="project" openIn="' + project.openIn + '" path="' + project.path + '" i="' + project.i + '">';
		html += '<img draggable="false" src="' + project.image + '">';
		html += '<div class="project-info"><h1>' + project.title + '</h1>';
		html += '<p>' + project.openIn + '</p></div>';
		html += '</div>';
	});

	//Return
	return html;
}

//Open Projects
$('body').on('click', '.project', async (e) => {
	//Clear Search
	$('.projects-search input').val('').trigger('input');

	//Get Project Info
	let project = $(e.currentTarget);
	let path = project.attr('path');
	let openIn = project.attr('openIn');

	//If file doesn't exist
	if (!fs.existsSync(path)) return alert('File does not exist');

	//Open folder or show file if Finder
	if (openIn == 'Finder') {
		//Detect if folder
		let isApp = path.split('.').pop() == 'app';
		let isFolder = isApp ? false : fs.statSync(path).isDirectory();

		//Open In Finder If Folder
		if (openIn == 'Finder' && isFolder) return shell.openPath(path);

		//Show In Finder If Not A Folder
		if (openIn == 'Finder' && !isFolder) return shell.showItemInFolder(path);
	}

	//Open Project
	open(path, { app: { name: openIn } });
});

//New Project Dialog
$('body').on('click', '.addProject', async () => {
	remote.dialog.showOpenDialog({ properties: ['openFile', 'openDirectory', 'createDirectory'] }).then(async (result) => {
		if (result.canceled) return;

		//Get Project Info
		let isFolder = result.filePaths[0].split('.').length < 2;
		let title = result.filePaths[0].split('/').pop();
		let path = result.filePaths[0];
		let openIn = 'Finder';

		//Get Icon
		let icon = isFolder ? './assets/icons/ico_folder.svg' : await getIcon(path);

		//Show Details Screen
		let HTML = await Details(title, path, icon, openIn, 'New');

		//Render Details Screen
		$('#app').html(HTML);

		//Focus Title
		$('.project-details-name').trigger('focus');
	});
});

//Search Projects
$('body').on('input', '.projects-search input', () => {
	//Search term
	const term = $('.projects-search input').val().toLowerCase();

	//Show Reset search icon
	if (term.length === 0) $('.projects-search-reset').addClass('hidden');
	if (term.length > 0) $('.projects-search-reset').removeClass('hidden');

	//Get results
	let results = projects.filter((project) => project.title.toLowerCase().includes(term));

	//Render html
	$('.projects').html(renderProjects(results));
});

//Reset search
$('body').on('click', '.projects-search-reset', () => {
	//Clear Search
	$('.projects-search input').val('').trigger('input');

	//Hide button
	$('.projects-search-reset').addClass('hidden');
});

//Export
module.exports = Home;
