module.exports = {
	smarty: {
		invalid: [
			'{if $tpl.path}'
		],
		valid: [
			'{$tpl.path.to.func($tpl.path, \'a\', $tpl.func())}',
			'{$tpl.path.to.prop}',

			'{if $tpl.case}{/if}',
			'{if $tpl.case}{else}{/if}',
			'{if $tpl.case}{else $tpl.otherCase}{/if}',
			'{if $tpl.case > 0}{/if}',
			'{if $tpl.case !== 0}{/if}',
			'{if $tpl.case !== (1 + 1)}{/if}',

			'{foreach $tpl.array as $item}{@index}{@number}{/foreach}',
			'{foreach $tpl.array as $item}{include template=some-template data1=@key data2=$tpl.data}{/foreach}',

			'{include template=some-template}',

			'{i18n key=translations.long_translation_key}',
			'{i18n key=translations.key passValue=@key passData=$tpl}'
		]
	},
	twig: {
		invalid: [
			'{% if $tpl.path %}'
		],
		valid: [
			'{{ $tpl.path.to.func($tpl.path, \'a\', $tpl.func()) }}',
			'{{ $tpl.path.to.prop }}',

			'{% if $tpl.case %}{% endif %}',
			'{% if $tpl.case %}{% else %}{% endif %}',
			'{% if $tpl.case %}{% elseif $tpl.otherCase %}{% endif %}',
			'{% if $tpl.case > 0 %}{% endif %}',
			'{% if $tpl.case !== 0 %}{% endif %}',
			'{% if $tpl.case !== (1 + 1) %}{% endif %}',

			'{% for $item in $tpl.array %}{{ @index }}{{ @number }}{% endfor %}',
			'{% for $item in $tpl.array %}{% include \'some-template\' with {data1: @key, data2: $tpl.data} %}{% endfor %}',

			'{% include \'some-template\' %}',

			'{% i18n \'translations.long_translation_key\' %}',
			'{% i18n \'translations.key\' with {passValue: @key, passData: $tpl} %}'
		]
	}
};
