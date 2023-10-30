(identifier) @variable
(param) @property
(plain_idiom_tail) @property
(basic_idiom_tail) @property
(local_idiom_path_tail) @property

(comment_token) @comment

(strand) @string
(date_time) @string
(number) @number
(duration) @number

; (function "function" @keyword)
(custom_function_name) @function

[
    ;"KW_NULL"
    "KW_NONE"
    "KW_TRUE"
    "KW_FALSE"
  ] @constant.builtin

"(" @punctuation.bracket
")" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
(kind
  "<" @punctuation.bracket
  ">" @punctuation.bracket
)
;(cast
  ;"<" @punctuation.bracket
  ;">" @punctuation.bracket
;)

(concrete_kind_list
  "|" @operator
  )

(statement_list ";" @operator)
(assigner) @operator
(or_operator) @operator
(and_operator) @operator
(relation_operator) @operator
(equality_operator) @operator
(additive_operator) @operator
(mult_operator) @operator
["->" "<-" "..."]  @operator

(dir) @operator

;;(builtin_function_names) @variable.builtin

;;(define_function_statement [":" ","] @operator)

(kind) @type
  

[
"KW_AFTER"
"KW_ALL"
"KW_ALLINSIDE"
"KW_ANALYZE"
"KW_ANALYZER"
"KW_AND"
"KW_ANYINSIDE"
"KW_AR"
"KW_ARA"
"KW_ARABIC"
"KW_AS"
"KW_ASC"
"KW_ASCENDING"
"KW_ASCII"
"KW_ASSERT"
"KW_AT"
"KW_BEFORE"
"KW_BEGIN"
"KW_BLANK"
"KW_BM25"
"KW_BREAK"
"KW_BY"
"KW_CAMEL"
"KW_CANCEL"
"KW_CAPACITY"
"KW_CHANGEFEED"
"KW_CHANGES"
"KW_CLASS"
"KW_COLLATE"
"KW_COLUMNS"
"KW_COMMENT"
"KW_COMMIT"
"KW_CONTAINS"
"KW_CONTAINSALL"
"KW_CONTAINSANY"
"KW_CONTAINSNONE"
"KW_CONTAINSNOT"
"KW_CONTENT"
"KW_CONTINUE"
"KW_COSINE"
"KW_CREATE"
"KW_DA"
"KW_DAN"
"KW_DANISH"
"KW_DATABASE"
"KW_DB"
"KW_DE"
"KW_DEFAULT"
"KW_DEFINE"
"KW_DELETE"
"KW_DESC"
"KW_DESCENDING"
"KW_DEU"
"KW_DIFF"
"KW_DIMENSION"
"KW_DIST"
"KW_DISTANCE"
"KW_DOC_IDS_ORDER"
"KW_DOC_LENGTHS_ORDER"
"KW_DROP"
"KW_DUPLICATE"
"KW_DUTCH"
"KW_EDDSA"
"KW_EDGENGRAM"
"KW_EL"
"KW_ELL"
"KW_ELSE"
"KW_EN"
"KW_END"
"KW_ENG"
"KW_ENGLISH"
"KW_ES"
"KW_ES256"
"KW_ES384"
"KW_ES512"
"KW_EUCLIDEAN"
"KW_EVENT"
"KW_EXPLAIN"
"KW_FALSE"
"KW_FETCH"
"KW_FIELD"
"KW_FIELDS"
"KW_FILTERS"
"KW_FLEX"
"KW_FLEXI"
"KW_FLEXIBLE"
"KW_FOR"
"KW_FR"
"KW_FRA"
"KW_FRENCH"
"KW_FROM"
"KW_FULL"
"KW_FUNCTION"
"KW_FUTURE"
"KW_GERMAN"
"KW_GREEK"
"KW_GROUP"
"KW_HAMMING"
"KW_HIGHLIGHTS"
"KW_HS256"
"KW_HS384"
"KW_HS512"
"KW_HU"
"KW_HUN"
"KW_HUNGARIAN"
"KW_IF"
"KW_IGNORE"
"KW_IN"
"KW_INDEX"
"KW_INFO"
"KW_INSERT"
"KW_INSIDE"
"KW_INTERSECTS"
"KW_INTO"
"KW_IS"
"KW_IT"
"KW_ITA"
"KW_ITALIAN"
"KW_KEY"
"KW_KILL"
"KW_KV"
"KW_LET"
"KW_LIMIT"
"KW_LIVE"
"KW_LOWERCASE"
"KW_MAHALANOBIS"
"KW_MANHATTAN"
"KW_MERGE"
"KW_MINKOWSKI"
"KW_MTREE"
"KW_NAMESPACE"
"KW_NGRAM"
"KW_NL"
"KW_NLD"
"KW_NO"
"KW_NOINDEX"
"KW_NONE"
"KW_NONEINSIDE"
"KW_NOR"
"KW_NORWEGIAN"
"KW_NOT"
"KW_NOTINSIDE"
"KW_NS"
"KW_NULL"
"KW_NUMERIC"
"KW_OMIT"
"KW_ON"
"KW_ONLY"
"KW_OPTION"
"KW_OR"
"KW_ORDER"
"KW_OUTSIDE"
"KW_PARALLEL"
"KW_PARAM"
"KW_PASSHASH"
"KW_PASSWORD"
"KW_PATCH"
"KW_PERMISSIONS"
"KW_POR"
"KW_PORTUGUESE"
"KW_POSTINGS_ORDER"
"KW_PS256"
"KW_PS384"
"KW_PS512"
"KW_PT"
"KW_PUNCT"
"KW_RAND"
"KW_RELATE"
"KW_REMOVE"
"KW_REPLACE"
"KW_RETURN"
"KW_RO"
"KW_ROLES"
"KW_ROMANIAN"
"KW_RON"
"KW_ROOT"
"KW_RS256"
"KW_RS384"
"KW_RS512"
"KW_RU"
"KW_RUS"
"KW_RUSSIAN"
"KW_SC"
"KW_SCHEMAFUL"
"KW_SCHEMAFULL"
"KW_SCHEMALESS"
"KW_SCOPE"
"KW_SEARCH"
"KW_SELECT"
"KW_SESSION"
"KW_SET"
"KW_SHOW"
"KW_SIGNIN"
"KW_SIGNUP"
"KW_SINCE"
"KW_SLEEP"
"KW_SNOWBALL"
"KW_SPA"
"KW_SPANISH"
"KW_SPLIT"
"KW_START"
"KW_SV"
"KW_SWE"
"KW_SWEDISH"
"KW_TA"
"KW_TABLE"
"KW_TAM"
"KW_TAMIL"
"KW_TB"
"KW_TERMS_ORDER"
"KW_THEN"
"KW_THROW"
"KW_TIMEOUT"
"KW_TOKEN"
"KW_TOKENIZERS"
"KW_TR"
"KW_TRANSACTION"
"KW_TRUE"
"KW_TUR"
"KW_TURKISH"
"KW_TYPE"
"KW_UNIQUE"
"KW_UNSET"
"KW_UPDATE"
"KW_UPPERCASE"
"KW_US"
"KW_USE"
"KW_USER"
"KW_VALUE"
"KW_VALUES"
"KW_VERSION"
"KW_VS"
"KW_WHEN"
"KW_WHERE"
"KW_WITH"
 ] @keyword
