<h2>Example template</h2>
<p>Example demonstartes simple use case of templates, by iterating over
objects, arrays and evaluating some conditional expressions.</p>

{if $tpl.showTable === 'summary'}
	{include template=test/examples/table-summary}
{else $tpl.showTable === 'full'}
	{include template=test/examples/table-full}
{else}
	<p>Nothing to show.</p>
{/if}

{if !$tpl.legacy}
	{i18n key=test.Showing_table_type type=Table 2=$tpl.showTable}
{else}
	{$i18n.translate('test.Showing_table_type', 'Table', $tpl.showTable)}
{/if}

