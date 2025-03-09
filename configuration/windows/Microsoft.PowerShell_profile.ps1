function Add-Alias($name, $alias) {
    $func = @"
function global:$name {
    `$expr = ('$alias ' + (( `$args | % { if (`$_.GetType().FullName -eq "System.String") { "``"`$(`$_.Replace('``"','````"').Replace("'","``'"))``"" } else { `$_ } } ) -join ' '))
    write-debug "Expression: `$expr"
    Invoke-Expression `$expr
}
"@
    write-debug "Defined function:`n$func"
    $func | iex
}

Add-Alias cl "clear"
Add-Alias lc "echo "Translated mistake 'lc' to 'cl'\n" && cl"
Add-Alias ls "eza"
Add-Alias sl "echo "Translated mistake 'sl' to 'ls'\n" && ls"
Add-Alias wignet "echo "Translated mistake 'wignet' to 'winget'\n" && winget"