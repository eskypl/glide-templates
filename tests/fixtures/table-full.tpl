<table>
  {foreach $tpl.data as $color}
  <tr style="background:{if @even}#fff{else}#f7f7f7{/if}">
    <td style="background: {$color[0]}">{@number}</td>
    <td>{@key}</td>
    <td>
      {foreach $color as $definition}
        {$definition.toLowerCase()}<br>
      {/foreach}
    </td>
  </tr>
  {/foreach}
</table>
