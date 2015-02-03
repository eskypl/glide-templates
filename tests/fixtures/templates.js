
define('tests/fixtures/table-summary',[],function(){function testsFixturesTableSummaryTpl($tpl) {
var _this=this,_="";_+="<table>  <tr>  ";var $rest=Array(5 - ($tpl.size() % 5));_+="  ";_this.e($tpl.data,function($color,i){_+="    <td style=\"background: "+$color[0]+"\" data-index=\""+i.index+"\">"+i.key+"</td>    ";if(i.number % 5 === 0){_+="</tr><tr>";}_+="    ";if(i.last && $rest.length > 0){_this.e($rest,function($cell,i){_+="<td>-</td>";});}_+="  ";});_+="  </tr></table><p>  <span>Total: "+$tpl.size()+",</span>  <span>Rest: "+$rest.length+"</span></p>";return _;
};return testsFixturesTableSummaryTpl;});

define('tests/fixtures/table-full',[],function(){function testsFixturesTableFullTpl($tpl) {
var _this=this,_="";_+="<table>  ";_this.e($tpl.data,function($color,i){_+="  <tr style=\"background:";if(i.even){_+="#fff";}else{_+="#f7f7f7";}_+="\">    <td style=\"background: "+$color[0]+"\">"+i.number+"</td>    <td>"+i.key+"</td>    <td>      ";_this.e($color,function($definition,i){_+="        "+$definition.toLowerCase()+"<br>      ";});_+="    </td>  </tr>  ";});_+="</table>";return _;
};return testsFixturesTableFullTpl;});

define('tests/fixtures/table',["view!tests/fixtures/table-summary","view!tests/fixtures/table-full"],function(){function testsFixturesTableTpl($tpl) {
var _this=this,_="";_+="<h2>Example template</h2><p>Example demonstartes simple use case of templates, by iterating overobjects, arrays and evaluating some conditional expressions.</p>";if($tpl.showTable === 'summary'){_+=_this.f(0,$tpl);}else if($tpl.showTable === 'full'){_+=_this.f(1,$tpl);}else{_+="<p>Nothing to show.</p>";}if(!$tpl.legacy){_+=_this.t("test.Showing_table_type",{"type":"Table","2":$tpl.showTable});}else{_+=$i18n.translate('test.Showing_table_type', 'Table', $tpl.showTable);}return _;
};testsFixturesTableTpl.includes=arguments;return testsFixturesTableTpl;});

define('tests/fixtures/include',["view!tests/fixtures/table"],function(){function testsFixturesIncludeTpl($tpl) {
var _this=this,_="";_+="Include: "+_this.f(0,$tpl);return _;
};testsFixturesIncludeTpl.includes=arguments;return testsFixturesIncludeTpl;});

define('tests/fixtures/deep-include',["view!tests/fixtures/include"],function(){function testsFixturesDeepIncludeTpl($tpl) {
var _this=this,_="";_+="Deep include: "+_this.f(0,$tpl);return _;
};testsFixturesDeepIncludeTpl.includes=arguments;return testsFixturesDeepIncludeTpl;});
