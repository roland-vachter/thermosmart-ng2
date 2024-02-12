import { Request, Response } from 'express';
import htmlParser, { Node } from 'node-html-parser';
import fs from 'fs';
import path from 'path';
import { getOutsideConditions } from '../services/outsideConditions';

const indexPath = __dirname.includes('dist') ? '../../../../dist/index.html' : '../../../dist/index.html';
const indexHtml = fs.readFileSync(path.join(__dirname, indexPath)).toString();
const indexHtmlParsed = htmlParser.parse(indexHtml);

indexHtmlParsed.querySelectorAll('script').forEach(s => {
	s.setAttribute('src', '/assets/' + s.attributes.src);
});

indexHtmlParsed?.querySelector('head')?.removeChild(indexHtmlParsed?.querySelector('head link[href=favicon.ico]') as Node);

indexHtmlParsed.querySelectorAll('link').forEach(s => {
	s.setAttribute('href', '/assets/' + s.attributes.href);
});

const titleEl = indexHtmlParsed.querySelector('title');
if (titleEl) {
	titleEl.innerHTML = 'SmartHome';
}

// const headEl = indexHtmlParsed.querySelector('head');
// if (headEl) {
// 	headEl.appendChild(htmlParser.parse('<link rel="icon" type="image/png" href="/assets/static/favicon-32x32.png" sizes="32x32">'));
// 	headEl.appendChild(htmlParser.parse('<link rel="icon" type="image/png" href="/assets/static/favicon-194x194.png" sizes="194x194">'));
// 	headEl.appendChild(htmlParser.parse('<link href="https://fonts.googleapis.com/css?family=Jura" rel="stylesheet"></link>'));
// }

const bodyEl = indexHtmlParsed.querySelector('body');

export default function (req: Request, res: Response) {
	if (!req.isAuthenticated()) {
		res.redirect('/login');
		return;
	}

	if (bodyEl) {
		bodyEl.setAttribute('style', `background-image: url(/assets/static/images/${getOutsideConditions()?.backgroundImage})`);
	}

	res.send(indexHtmlParsed.toString());
};
