(doc_single_line_comment) @comment
(single_line_comment) @comment
(doc_multi_line_comment) @comment
(multi_line_comment) @comment

(plain_strand) @string
(record_strand) @string
(datetime_strand) @string
(uuid_strand) @string
(number) @number
(integer) @number
(param) @variable.parameter

(kind) @type

"(" @punctuation.bracket
")" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"|" @punctuation.bracket

";" @punctuation.delimiter
":" @punctuation.delimiter

(null) @constant.builtin
(none) @constant.builtin
(boolean) @constant.builtin
  
(range_operator) @operator
(prefix_operator) @operator
(or_operator) @operator
(add_operator) @operator
(and_operator) @operator
(eq_operator) @operator
(mull_operator) @operator
(relation_operator) @operator
(knn_operator) @operator
(graph_operator_token) @operator
"**" @operator
"->" @operator


[
"KW_WHERE"
"KW_AND"
"KW_OR"
"KW_IS"
"KW_IF"
"KW_LET"
"KW_SELECT"
"KW_ONLY"
"KW_VALUE"
"KW_AS"
"KW_THEN"
"KW_FROM"
"KW_BEGIN"
"KW_COMMIT"
"KW_CANCEL"
"KW_TRANSACTION"
"KW_BREAK"
"KW_CONTINUE"
"KW_ALTER"
"KW_TABLE"
"KW_EXISTS"
"KW_COMMENT"
"KW_NONE"
"KW_DROP"
"KW_SCHEMALESS"
"KW_SCHEMAFULL"
"KW_SCHEMAFUL"
"KW_CHANGEFEED"
"KW_INCLUDE"
"KW_ORIGINAL"
"KW_OMIT"
"KW_RETURN"
 ] @keyword
