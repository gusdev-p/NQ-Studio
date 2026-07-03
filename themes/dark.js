import {createTheme} from 'thememirror';
import {tags as t} from '@lezer/highlight';

const nqThemeDark = createTheme({
	variant: 'dark',
	settings: {
		background: '#1c1c1c',
		foreground: '#f1f1f1',
		caret: '#613583',
		selection: '#70b4f8',
		lineHighlight: '#8a91991a',
		gutterBackground: '#2c2c2c',
		gutterForeground: '#f1f1f1',
	},
	styles: [
		{
			tag: t.comment,
			color: '#447b0c',
		},
		{
			tag: t.variableName,
			color: '#99c1f1',
		},
		{
			tag: [t.string, t.special(t.brace)],
			color: '#5c9820',
		},
		{
			tag: t.number,
			color: '#f9f06b',
		},
		{
			tag: t.bool,
			color: '#ffa348',
		},
		{
			tag: t.null,
			color: '#f66151',
		},
		{
			tag: t.keyword,
			color: '#f66151',
		},
		{
			tag: t.operator,
			color: '#f1f1f1',
		},
		{
			tag: t.className,
			color: '#e5a50a',
		},
		{
			tag: t.definition(t.typeName),
			color: '#3584e4',
		},
		{
			tag: t.typeName,
			color: '#dc8add',
		},
		{
			tag: t.angleBracket,
			color: '#f1f1f1',
		},
		{
			tag: t.tagName,
			color: '#f6d32d',
		},
		{
			tag: t.attributeName,
			color: '#ffa348',
		},
	],
});