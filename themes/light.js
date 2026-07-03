import {createTheme} from 'thememirror';
import {tags as t} from '@lezer/highlight';

const nqThemeLight = createTheme({
	variant: 'light',
	settings: {
		background: '#f1f1f1',
		foreground: '#1c1c1c',
		caret: '#1c1c1c',
		selection: '#70b4f8',
		lineHighlight: '#deddda',
		gutterBackground: '#c5c5c5',
		gutterForeground: '#1c1c1c',
	},
	styles: [
		{
			tag: t.comment,
			color: '#447b0c',
		},
		{
			tag: t.variableName,
			color: '#1c71d8',
		},
		{
			tag: [t.string, t.special(t.brace)],
			color: '#5c9820',
		},
		{
			tag: t.number,
			color: '#e5a50a',
		},
		{
			tag: t.bool,
			color: '#ffa348',
		},
		{
			tag: t.null,
			color: '#c01c28',
		},
		{
			tag: t.keyword,
			color: '#c01c28',
		},
		{
			tag: t.operator,
			color: '#2c2c2c',
		},
		{
			tag: t.className,
			color: '#f59f1e',
		},
		{
			tag: t.definition(t.typeName),
			color: '#3584e4',
		},
		{
			tag: t.typeName,
			color: '#9141ac',
		},
		{
			tag: t.angleBracket,
			color: '#1c1c1c',
		},
		{
			tag: t.tagName,
			color: '#e5a50a',
		},
		{
			tag: t.attributeName,
			color: '#c64600',
		},
	],
});