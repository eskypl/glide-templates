<table>
  <tr>
  {assign var=$rest value=Array(5 - ($tpl.size() % 5))}
  {foreach $tpl.data as $color}
    <td style="background: {$color[0]}" data-index="{@index}">{@key}</td>
    {if @number % 5 === 0}</tr><tr>{/if}
    {if @last && $rest.length > 0}{foreach $rest as $cell}<td>-</td>{/foreach}{/if}
  {/foreach}
  </tr>
</table>
<p>
  <span>Total: {$tpl.size()},</span>
  <span>Rest: {$rest.length}</span>
</p>
