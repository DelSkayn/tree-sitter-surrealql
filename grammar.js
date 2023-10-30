
const caseInsensitiveRegex = (word) =>
  new RegExp(
    word
      .split("")
      .map((char) => `[${char.toLowerCase()}${char.toUpperCase()}]`)
      .join(""),
  );

const tag = (tag) => {
  caseInsensitiveRegex(tag);
};

const kw = (keyword) => {
  if (keyword.toUpperCase() != keyword) {
    throw new Error("Expected uppercase keyword got ${keyword}");
  }

  const words = keyword.split(" ");
  if (words.length != 1) {
    throw new Error("Expected single,unspaced keyword");
  }
  const regExps = caseInsensitiveRegex(words[0]);
  return alias(token(prec(5, regExps)), "KW_" + keyword);
};

const seperatedList0 = (by, parser) => optional(seperatedList1(by, parser));
const seperatedList1 = (by, parser) => seq(parser, repeat(seq(by, parser)));

const optionList = (...array) => {
  const len = array.length;
  let res = [];
  for (let i = 0; i < array.length; i++) {
    const head = array[i];
    const rem = array.toSpliced(0, i + 1);
    if (rem.length == 0) {
      res.push(head);
    } else {
      res.push(seq(head, ...rem.map((x) => prec.right(optional(x)))));
    }
  }
  return prec.right(choice(...res));
};

const digit = /[0-9]/;
const date_time_year = /[+\-][0-9][0-9][0-9][0-9]/;
const date_time_month = /[0-9][0-9]/;
const date_time_day = /[0-9][0-9]/;
const date_time_hour = /[0-9][0-9]/;
const date_time_minute = /[0-9][0-9]/;
const date_time_second = /[0-9][0-9]/;
const date_time_nano_seconds = /[0-9]+/;
const date_time_zone = choice(
  "Z",
  seq(/[+\-]/, date_time_hour, ":", date_time_minute),
);
const date_time_time = seq(
  date_time_year,
  "-",
  date_time_month,
  "-",
  date_time_day,
  "T",
  date_time_hour,
  "-",
  date_time_minute,
  "-",
  date_time_second,
  optional(date_time_nano_seconds),
  date_time_zone,
);

module.exports = grammar({
  name: "surrealql",

  extras: ($) => [$.comment_token, /\s+/],

  word: ($) => $.raw_identifier,

  rules: {
    query: ($) => optional($.statement_list),
    statement_list: ($) =>
      seq(seperatedList1(repeat1(";"), $.statement), repeat(";")),

    statement: ($) =>
      choice(
        prec(10, $.analyze_statement),
        prec(10, $.begin_statement),
        prec(10, $.break_statement),
        prec(10, $.cancel_statement),
        prec(10, $.commit_statement),
        prec(10, $.continue_statement),
        prec(10, $.create_statement),
        prec(10, $.define_statement),
        prec(10, $.delete_statement),
        prec(10, $.for_statement),
        prec(10, $.if_statement),
        prec(10, $.info_statement),
        prec(10, $.insert_statement),
        prec(10, $.live_statement),
        prec(10, $.kill_statement),
        prec(10, $.option_statement),
        prec(10, $.return_statement),
        prec(10, $.relate_statement),
        prec(10, $.remove_statement),
        prec(10, $.select_statement),
        prec(10, $.let_statement),
        prec(10, $.show_statement),
        prec(10, $.sleep_statement),
        prec(10, $.throw_statement),
        prec(10, $.update_statement),
        prec(10, $.use_statement),
        /* LOOKAHEAD(0) =/= [Production { name: "RootStatementKeyword" }] */
        prec(1, $.value),
      ),

    analyze_statement: ($) => seq(kw("ANALYZE"), $.analyze_sub_statement),
    begin_statement: ($) => seq(kw("BEGIN"), optional(kw("TRANSACTION"))),
    break_statement: ($) => kw("BREAK"),
    cancel_statement: ($) => seq(kw("CANCEL"), optional(kw("TRANSACTION"))),
    commit_statement: ($) => seq(kw("COMMIT"), optional(kw("TRANSACTION"))),
    continue_statement: ($) => kw("CONTINUE"),
    create_statement: ($) =>
      prec.right(
        seq(
          kw("CREATE"),
          choice(
            prec(2, seq(kw("ONLY"), seperatedList1(",", $.what_value))),
            prec(1, seperatedList1(",", $.what_value)),
          ),
          optional($._create_statement_tail),
        ),
      ),

    _create_statement_tail: ($) =>
      optionList($.data, $.output, $.timeout, kw("PARALLEL")),

    define_statement: ($) =>
      seq(
        kw("DEFINE"),
        choice(
          $.define_namespace_statement,
          $.define_database_statement,
          $.define_function_statement,
          $.define_user_statement,
          $.define_token_statement,
          $.define_scope_statement,
          $.define_param_statement,
          $.define_table_statement,
          $.define_event_statement,
          $.define_field_statement,
          $.define_index_statement,
          $.define_analyzer_statement,
        ),
      ),
    delete_statement: ($) =>
      prec.right(
        seq(
          kw("DELETE"),
          optional(kw("FROM")),
          choice(
            prec(2, seq(kw("ONLY"), seperatedList1(",", $.what_value))),
            prec(1, seperatedList1(",", $.what_value)),
          ),
          optional($._delete_statement_tail),
        ),
      ),

    _delete_statement_tail: ($) =>
      optionList($.condition, $.output, $.timeout, kw("PARALLEL")),

    for_statement: ($) => seq(kw("FOR"), $.param, kw("IN"), $.value, $.block),

    if_statement: ($) =>
      prec.right(
        seq(
          kw("IF"),
          $.value,
          choice(
            seq(kw("THEN"), $.value, $.if_worded_tail),
            seq($.block, optional($.if_bracket_tail)),
          ),
        ),
      ),

    info_statement: ($) =>
      seq(
        kw("INFO"),
        kw("FOR"),
        choice(
          kw("ROOT"),
          kw("KV"),
          $.namespace_keyword,
          $.database_keyword,
          seq($.scope_keyword, $.identifier),
          seq($.table_keyword, $.identifier),
          seq($.user_keyword, $.identifier, optional(seq(kw("ON"), $.base))),
        ),
      ),

    insert_statement: ($) =>
      prec.right(
        seq(
          kw("INSERT"),
          optional(kw("IGNORE")),
          kw("INTO"),
          $.table_or_param,
          $.insert_data,
          optional($._insert_statement_tail),
        ),
      ),

    _insert_statement_tail: ($) =>
      optionList($.insert_update, $.output, $.timeout, kw("PARALLEL")),

    live_statement: ($) =>
      choice(
        seq(
          kw("LIVE"),
          kw("SELECT"),
          choice(kw("DIFF"), $.fields),
          kw("FROM"),
          $.table_or_param,
          optional($.condition),
          optional($.fetch),
        ),
        $.fields,
        kw("DIFF"),
        seq(
          /* LOOKAHEAD(0) =/= [Leaf { case_sensitive: false, value: "DIFF" }] */
          $.fields,
        ),
      ),

    kill_statement: ($) => seq(kw("KILL"), $.kill_target),

    kill_target: ($) => choice($.param, $.uuid),

    option_statement: ($) =>
      choice(
        seq(kw("OPTION"), $.identifier, "=", kw("TRUE")),
        seq(kw("OPTION"), $.identifier, "=", kw("FALSE")),
      ),

    return_statement: ($) =>
      prec.right(seq(kw("RETURN"), $.value, optional($.fetch))),

    relate_statement: ($) =>
      prec.right(
        seq(
          kw("RELATE"),
          optional(kw("ONLY")),
          $.relation,
          optional($._relate_statement_tail),
        ),
      ),

    _relate_statement_tail: ($) =>
      optionList(kw("UNIQUE"), $.data, $.output, $.timeout, kw("PARALLEL")),

    remove_statement: ($) =>
      prec.right(seq(
        kw("REMOVE"),
        choice(
          seq($.namespace_keyword, $.identifier),
          seq($.database_keyword, $.identifier),
          seq(kw("FUNCTION"), $.custom_function_name, optional(seq("(", ")"))),
          seq(kw("TOKEN"), $.identifier, kw("ON"), $.base_or_scope),
          seq(kw("SCOPE"), $.identifier),
          seq(kw("PARAM"), $.param),
          seq(kw("TABLE"), $.identifier),
          seq(
            kw("EVENT"),
            $.identifier,
            kw("ON"),
            optional(kw("TABLE")),
            $.identifier,
          ),
          seq(
            kw("FIELD"),
            $.local_idiom,
            kw("ON"),
            optional(kw("TABLE")),
            $.identifier,
          ),
          seq(kw("INDEX"), $.identifier, kw("ON"), $.identifier),
          seq(kw("ANALYZER"), $.identifier),
          seq(kw("USER"), $.identifier, kw("ON"), $.base),
        ),
      )),

    select_statement: ($) =>
      prec.right(
        seq(
          kw("SELECT"),
          $.fields,
          optional($.omit),
          kw("FROM"),
          choice(
            prec(2, seq(kw("ONLY"), seperatedList1(",", $.value))),
            prec(1, seperatedList1(",", $.value)),
          ),
          optional($._select_statement_tail),
        ),
      ),

    _select_statement_tail: ($) =>
      optionList(
        $.with,
        $.condition,
        $.split,
        $.group,
        $.order_statement,
        $.limit,
        $.start,
        $.fetch,
        $.version,
        $.timeout,
        kw("PARALLEL"),
        $.explain,
      ),

    let_statement: ($) => seq(kw("LET"), $.param, "=", $.value),

    show_statement: ($) =>
      seq(
        kw("SHOW"),
        kw("CHANGES"),
        kw("FOR"),
        $.table_or_database,
        $.since,
        optional($.show_limit),
      ),

    sleep_statement: ($) => seq(kw("SLEEP"), $.duration),

    throw_statement: ($) => seq(kw("THROW"), $.value),

    update_statement: ($) =>
      seq(
        kw("UPDATE"),
        optional(kw("ONLY")),
        $.what_list,
        optional($._update_statement_tail),
      ),

    _update_statement_tail: ($) =>
      optionList($.data, $.condition, $.output, $.timeout, kw("PARALLEL")),

    use_statement: ($) =>
      seq(
        kw("USE"),
        choice(
          seq(
            $.namespace_keyword,
            $.identifier,
            optional(seq($.database_keyword, $.identifier)),
          ),
          seq($.database_keyword, $.identifier),
        ),
      ),

    value: ($) =>
      prec(
        -1,
        choice(
          $.unary_expression,
          prec.left(7, seq($.value, "**", $.value)),
          prec.left(6, seq($.value, $.mult_operator, $.value)),
          prec.left(5, seq($.value, $.additive_operator, $.value)),
          prec.left(4, seq($.value, $.relation_operator, $.value)),
          prec.left(3, seq($.value, $.equality_operator, $.value)),
          prec.left(2, seq($.value, $.and_operator, $.value)),
          prec.left(1, seq($.value, $.or_operator, $.value)),
        ),
      ),

    or_operator: ($) => choice(kw("OR"), "||"),

    and_operator: ($) => choice(kw("AND"), "&&"),

    relation_operator: ($) => choice("<=", "<", ">=", ">"),

    equality_operator: ($) =>
      choice(
        "==",
        "!=",
        "*=",
        "?=",
        "=",
        "!~",
        "*~",
        "?~",
        "~",
        "∋",
        "∌",
        "∈",
        "∉",
        "⊇",
        "⊃",
        "⊅",
        "⊆",
        "⊂",
        "⊄",
        seq(kw("IS"), optional(kw("NOT"))),
        kw("CONTAINSALL"),
        kw("CONTAINSANY"),
        kw("CONTAINSNONE"),
        kw("CONTAINSNOT"),
        kw("CONTAINS"),
        kw("ALLINSIDE"),
        kw("ANYINSIDE"),
        kw("NONEINSIDE"),
        kw("NOTINSIDE"),
        kw("INSIDE"),
        kw("OUTSIDE"),
        kw("INTERSECTS"),
        seq(kw("NOT"), kw("IN")),
        kw("IN"),
        $.matches,
        $.knn,
      ),

    matches: ($) => seq("@", $.integer, "@"),

    knn: ($) => seq("knn", "<", $.integer, ">"),

    additive_operator: ($) => choice("+", "-"),

    mult_operator: ($) => choice("*", "×", "∙", "/", "÷"),

    analyze_sub_statement: ($) =>
      seq(kw("INDEX"), $.identifier, kw("ON"), $.identifier),

    what_list: ($) => seperatedList1(",", $.what_value),

    data: ($) =>
      prec.right(
        choice(
          seq(kw("SET"), seperatedList1(",", $.data_set)),
          seq(kw("UNSET"), seperatedList1(",", $.plain_idiom)),
          seq(kw("PATCH"), $.value),
          seq(kw("MERGE"), $.value),
          seq(kw("REPLACE"), $.value),
          seq(kw("CONTENT"), $.value),
        ),
      ),

    output: ($) =>
      seq(
        kw("RETURN"),
        choice(
          prec(2, kw("NONE")),
          prec(2, kw("NULL")),
          prec(2, kw("DIFF")),
          prec(2, kw("AFTER")),
          prec(2, kw("BEFORE")),
          prec(1, $.fields),
        ),
      ),

    timeout: ($) => seq(kw("TIMEOUT"), $.duration),

    define_namespace_statement: ($) =>
      prec.right(seq($.namespace_keyword, $.identifier, optional($.comment))),

    define_database_statement: ($) =>
      prec.right(seq($.database_keyword, $.identifier, repeat($.define_database_opt))),

    define_function_statement: ($) =>
      prec.right(seq(
        "FUNCTION",
        $.custom_function_name,
        "(",
        repeat($.function_param),
        optional(","),
        ")",
        $.block,
        repeat($.define_function_opt),
      )),

    define_user_statement: ($) =>
      prec.right(seq(
        kw("USER"),
        $.identifier,
        kw("ON"),
        $.base,
        repeat($.define_user_opt),
      )),

    define_token_statement: ($) =>
      prec.right(seq(
        kw("TOKEN"),
        $.identifier,
        kw("ON"),
        $.base_or_scope,
        repeat($.define_token_opt),
      )),

    define_scope_statement: ($) =>
      prec.right(seq(kw("SCOPE"), $.identifier, repeat($.define_scope_opt))),

    define_param_statement: ($) =>
      prec.right(seq(kw("PARAM"), $.param, repeat($.define_param_opt))),

    define_table_statement: ($) =>
      prec.right(seq(kw("TABLE"), $.identifier, repeat($.define_table_opt))),

    define_event_statement: ($) =>
      prec.right(seq(
        kw("EVENT"),
        $.identifier,
        kw("ON"),
        optional(kw("TABLE")),
        $.identifier,
        repeat($.define_event_opt),
      )),

    define_field_statement: ($) =>
      prec.right(seq(
        kw("FIELD"),
        $.local_idiom,
        kw("ON"),
        optional(kw("TABLE")),
        $.identifier,
        repeat($.define_field_opt),
      )),

    define_index_statement: ($) =>
      prec.right(seq(
        kw("INDEX"),
        $.identifier,
        kw("ON"),
        optional(kw("TABLE")),
        $.identifier,
        repeat($.define_index_opt),
      )),

    define_analyzer_statement: ($) =>
      prec.right(seq(kw("ANALYZER"), $.identifier, repeat($.define_analyzer_opt))),

    condition: ($) => prec.right(seq(kw("WHERE"), $.value)),

    param: ($) => /\$[a-zA-Z0-9_]+/,

    block: ($) => seq("{", $.block_statement_list, "}"),

    if_worded_tail: ($) =>
      prec.right(
        choice(
          kw("END"),
          seq(
            kw("ELSE"),
            choice(
              prec(
                2,
                seq(kw("IF"), $.value, kw("THEN"), $.value, $.if_worded_tail),
              ),
              prec(1, seq($.value, kw("END"))),
            ),
          ),
        ),
      ),

    if_bracket_tail: ($) =>
      prec.right(
        choice(
          seq(kw("ELSE"), $.block),
          seq(
            kw("ELSE"),
            kw("IF"),
            $.value,
            $.block,
            optional($.if_bracket_tail),
          ),
        ),
      ),

    namespace_keyword: ($) => choice(kw("NS"), kw("NAMESPACE")),
    database_keyword: ($) => choice(kw("DB"), kw("DATABASE")),
    scope_keyword: ($) => choice(kw("SCOPE"), kw("SC")),
    table_keyword: ($) => choice(kw("TABLE"), kw("TB")),
    user_keyword: ($) => choice(kw("USER"), kw("US")),

    base: ($) =>
      choice($.namespace_keyword, $.database_keyword, kw("ROOT"), kw("KV")),

    table_or_param: ($) => choice($.param, $.identifier),

    insert_data: ($) =>
      prec.right(
        choice(
          prec(
            2,
            seq(
              "(",
              seperatedList1(",", $.plain_idiom),
              ")",
              kw("VALUES"),
              $.insert_data_values_list,
            ),
          ),
          prec(
            1,
            seq(
              /* LOOKAHEAD(0) =/= [Leaf { case_sensitive: true, value: "(" }] */
              $.value,
            ),
          ),
        ),
      ),

    insert_update: ($) =>
      prec.right(
        seq(
          prec(2, kw("ON")),
          prec(2, kw("DUPLICATE")),
          prec(2, kw("KEY")),
          prec(2, kw("UPDATE")),
          prec(1, seperatedList1(",", $.insert_update_value)),
        ),
      ),

    fetch: ($) =>
      prec.right(seq(kw("FETCH"), seperatedList1(",", $.plain_idiom))),

    fields: ($) =>
      choice(
        prec.right(
          2,
          seq(kw("VALUE"), $.value, optional(seq(kw("AS"), $.plain_idiom))),
        ),
        prec.right(
          1,
          seq(
            /* LOOKAHEAD(0) =/= [Leaf { case_sensitive: false, value: "VALUE" }] */
            seperatedList1(",", $.field),
          ),
        ),
      ),

    relation: ($) =>
      choice(
        seq($.relation_value, "->", $.thing_or_table, "->", $.relation_value),
        seq($.relation_value, "<-", $.thing_or_table, "<-", $.relation_value),
      ),

    custom_function_name: ($) => seq("fn", repeat1(seq("::", $.identifier))),

    base_or_scope: ($) => choice($.base, seq(kw("SCOPE"), $.identifier)),

    local_idiom: ($) => prec.right(seq($.local_idiom_path, optional("..."))),

    omit: ($) => seq(kw("OMIT"), seperatedList1(",", $.plain_idiom)),

    with: ($) =>
      prec.right(
        seq(
          kw("WITH"),
          choice(
            kw("NOINDEX"),
            seq(kw("NO"), kw("INDEX")),
            seq(kw("INDEX"), seperatedList1(",", $.identifier)),
          ),
        ),
      ),

    split: ($) =>
      prec.right(
        seq(
          kw("SPLIT"),
          choice(
            prec(2, seq(kw("ON"), seperatedList1(",", $.basic_idiom))),
            prec(1, seperatedList1(",", $.basic_idiom)),
          ),
        ),
      ),

    group: ($) =>
      prec.right(
        seq(
          kw("GROUP"),
          choice(
            prec(2, kw("ALL")),
            prec(2, seq(kw("BY"), seperatedList1(",", $.basic_idiom))),
            /* LOOKAHEAD(0) =/= [Leaf { case_sensitive: false, value: "BY" }, Leaf { case_sensitive: false, value: "ALL" }] */
            prec(1, seperatedList1(",", $.basic_idiom)),
          ),
        ),
      ),

    order_statement: ($) =>
      prec.right(
        seq(
          kw("ORDER"),
          choice(prec(2, seq(kw("BY"), $.order_kind)), prec(1, $.order_kind)),
        ),
      ),

    limit: ($) =>
      prec.right(
        seq(
          kw("LIMIT"),
          choice(prec(2, seq(kw("BY"), $.value)), prec(1, $.value)),
        ),
      ),

    start: ($) =>
      prec.right(
        seq(
          kw("START"),
          choice(prec(2, seq(kw("AT"), $.value)), prec(1, $.value)),
        ),
      ),

    version: ($) => prec.right(seq(kw("VERSION"), $.date_time)),

    explain: ($) => prec.right(seq(kw("EXPLAIN"), optional(kw("FULL")))),

    table_or_database: ($) =>
      choice(seq(kw("TABLE"), $.identifier), $.database_keyword),

    since: ($) =>
      choice(seq(kw("SINCE"), $.integer), seq(kw("SINCE"), $.date_time)),

    show_limit: ($) => seq(kw("LIMIT"), $.integer),

    duration: ($) =>
      token(
        repeat1(
          seq(
            /[0-9]+/,
            choice("ns", "µs", "us", "ms", "s", "m", "h", "d", "w", "y"),
          ),
        ),
      ),

    what_value: ($) => choice($.future, $.what_idiom),

    comment: ($) => seq(kw("COMMENT"), $.strand),

    block_statement_list: ($) =>
      seq(seperatedList1(repeat1(";"), $.block_statement), repeat(";")),

    insert_data_values_list: ($) =>
      prec.right(seperatedList1(",", seq("(", $.insert_data_values, ")"))),

    plain_idiom: ($) =>
      prec.right(
        choice(
          seq($.identifier, repeat($.plain_idiom_tail)),
          seq($.graph, repeat($.plain_idiom_tail)),
        ),
      ),

    plain_idiom_tail: ($) =>
      choice(
        "...",
        $.graph,
        seq(".", $.idiom_dot),
        seq("[", $.idiom_bracket, "]"),
      ),

    field_list: ($) => seperatedList1(",", $.field),

    relation_value: ($) =>
      choice(
        $.sub_query,
        $.array,
        $.param,
        /* LOOKAHEAD(0) =/= [Production { name: "SubQueryKeyword" }] */
        $.thing,
      ),

    thing: ($) => seq($.identifier, ":", $.thing_id),

    thing_or_table: ($) =>
      choice(
        prec(2, $.thing),
        /* LOOKAHEAD(1) =/= [Leaf { case_sensitive: true, value: ":" }] */
        prec(1, $.identifier),
      ),

    path_like: ($) =>
      seq($.identifier, "::", seperatedList1("::", $.identifier)),

    local_idiom_path: ($) =>
      prec.right(seq($.identifier, repeat($.local_idiom_path_tail))),

    local_idiom_path_tail: ($) =>
      choice(
        seq(".", $.idiom_dot),
        seq("[", "*", "]"),
        seq("[", $.number, "]"),
      ),

    order_kind: ($) =>
      prec.right(
        choice(
          prec(2, seq(kw("RAND"), "(", ")")),
          /* LOOKAHEAD(0) =/= [Leaf { case_sensitive: true, value: "RAND" }] */
          prec(1, seperatedList1(",", $.order)),
        ),
      ),

    date_time: ($) =>
      token(
        seq(
          "t",
          choice(seq('"', date_time_time, '"'), seq("'", date_time_time, "'")),
        ),
      ),

    integer: ($) => /[0-9]+/,

    future: ($) => seq("<", kw("FUTURE"), ">", $.block),

    what_idiom: ($) =>
      prec.right(seq($.what_idiom_primary, repeat($.idiom_expression_tail))),

    data_set: ($) => prec.right(seq($.plain_idiom, $.assigner, $.value)),

    strand: ($) =>
      token(choice(seq('"', /[^"]*/, '"'), seq("'", /[^']*/, "'"))),

    define_database_opt: ($) => choice($.comment, $.change_feed),

    function_param: ($) => seq($.param, ":", $.inner_kind),

    define_function_opt: ($) =>
      choice($.comment, seq(kw("PERMISSIONS"), $.permission_value)),

    define_user_opt: ($) =>
      prec.right(
        choice(
          $.comment,
          seq(kw("PASSWORD"), $.strand),
          seq(kw("PASSHASH"), $.strand),
          seq(kw("ROLES"), seperatedList1(",", $.identifier)),
        ),
      ),

    define_token_opt: ($) =>
      choice(
        seq(kw("TYPE"), $.algorithm),
        seq(kw("VALUE"), $.strand),
        $.comment,
      ),

    define_scope_opt: ($) =>
      choice(
        seq(kw("SESSION"), $.duration),
        seq(kw("SIGNUP"), $.value),
        seq(kw("SIGNIN"), $.value),
        $.comment,
      ),

    define_param_opt: ($) =>
      choice(seq(kw("VALUE"), $.value), $.comment, $.permissions),

    define_table_opt: ($) =>
      choice(
        kw("DROP"),
        kw("SCHEMALESS"),
        kw("SCHEMAFUL"),
        kw("SCHEMAFULL"),
        $.comment,
        $.permissions,
        $.change_feed,
        $.view,
      ),

    define_event_opt: ($) =>
      prec.right(
        choice(
          seq(kw("WHEN"), $.value),
          seq(kw("THEN"), seperatedList1(",", $.value)),
          $.comment,
        ),
      ),

    define_field_opt: ($) =>
      choice(
        kw("FLEXIBLE"),
        kw("FLEXI"),
        kw("FLEX"),
        seq(kw("TYPE"), $.inner_kind),
        seq(kw("VALUE"), $.value),
        seq(kw("ASSERT"), $.value),
        seq(kw("DEFAULT"), $.value),
        $.comment,
      ),

    define_index_opt: ($) =>
      prec.right(
        choice(
          seq(kw("COLUMNS"), seperatedList1(",", $.local_idiom)),
          seq(kw("FIELDS"), seperatedList1(",", $.local_idiom)),
          $.index,
          $.comment,
        ),
      ),

    define_analyzer_opt: ($) =>
      prec.right(
        choice(
          seq(kw("FILTERS"), seperatedList1(",", $.filter)),
          seq(kw("TOKENIZERS"), seperatedList1(",", $.tokenizer)),
          $.comment,
        ),
      ),

    block_statement: ($) =>
      choice(
        prec(9, $.let_statement),
        prec(9, $.if_statement),
        prec(9, $.select_statement),
        prec(9, $.create_statement),
        prec(9, $.update_statement),
        prec(9, $.delete_statement),
        prec(9, $.relate_statement),
        prec(9, $.insert_statement),
        prec(9, $.return_statement),
        prec(9, $.define_statement),
        prec(9, $.remove_statement),
        prec(9, $.break_statement),
        prec(9, $.continue_statement),
        prec(9, $.for_statement),
        /* LOOKAHEAD(0) =/= [Production { name: "BlockStatementKeyword" }] */
        prec(1, $.value),
      ),

    insert_data_values: ($) =>
      choice(seq($.insert_data_values, ",", $.value), $.value),

    insert_update_value: ($) => seq($.plain_idiom, $.assigner, $.value),

    graph: ($) =>
      seq($.dir, choice($.identifier, "?", seq("(", $.custom_graph, ")"))),

    idiom_dot: ($) => choice("*", $.identifier),

    idiom_bracket: ($) =>
      choice(
        "*",
        "$",
        $.number,
        seq("?", $.value),
        seq(kw("WHERE"), $.value),
        seq(
          /* LOOKAHEAD(0) =/= [Leaf { case_sensitive: true, value: "WHERE" }] */
          $.idiom_bracket_value,
        ),
      ),

    field: ($) =>
      prec.right(
        choice("*", seq($.value, optional(seq(kw("AS"), $.plain_idiom)))),
      ),

    sub_query: ($) =>
      choice(
        prec(2, seq("(", $.sub_query_statement, ")")),
        prec(
          1,
          seq(
            "(" /* LOOKAHEAD(0) =/= [Production { name: "ParentasizedSubQueryKeyword" }] */,
            $.value,
            ")",
          ),
        ),
        prec(8,$.if_statement),
        prec(8,$.delete_statement),
        prec(8,$.remove_statement),
        prec(8,$.relate_statement),
        prec(8,$.insert_statement),
        prec(8,$.define_statement)
      ),

    object_like: ($) => choice(prec(2, $.object), prec(1, $.block)),

    object: ($) =>
      seq("{", seperatedList0(",", $.object_entry), optional(","), "}"),

    object_entry: ($) =>
      choice(seq($.strand, ":", $.value), seq($.identifier, ":", $.value)),

    array: ($) => seq("[", seperatedList0(",", $.value), optional(","), "]"),

    number: ($) => /[0-9]+\(\.[0-9]+\)?\([eE][+-]?[0-9]+\)/,

    basic_idiom: ($) =>
      prec.right(seq($.identifier, repeat($.basic_idiom_tail))),

    basic_idiom_tail: ($) =>
      choice(
        seq(".", $.idiom_dot),
        seq("[", "*", "]"),
        seq("[", "$", "]"),
        seq("[", $.number, "]"),
      ),

    what_idiom_primary: ($) =>
      choice(
        prec(3, $.sub_query),
        prec(3, $.path_like),
        prec(3, $.date_time),
        prec(3, $.number),
        prec(3, $.param),
        /* LOOKAHEAD(1) == [Leaf { case_sensitive: true, value: ":" }, Leaf { case_sensitive: true, value: "::" }] */
        prec(2, $.thing_or_range),
        prec(2, $.duration),
        /* LOOKAHEAD(1) =/= [Leaf { case_sensitive: true, value: ":" }, Leaf { case_sensitive: true, value: "::" }] */
        /* LOOKAHEAD(0) =/= [Production { name: "SubQueryKeyword" }] */
        prec(1, $.identifier),
      ),

    assigner: ($) => choice("=", "+=", "-=", "+?="),

    change_feed: ($) => seq(kw("CHANGEFEED"), $.duration),

    kind: ($) => seq("<", $.inner_kind, ">"),

    permission_value: ($) => choice(kw("NONE"), kw("FULL"), $.condition),

    algorithm: ($) =>
      choice(
        kw("EDDSA"),
        kw("ES256"),
        kw("ES384"),
        kw("ES512"),
        kw("HS256"),
        kw("HS384"),
        kw("HS512"),
        kw("PS256"),
        kw("PS384"),
        kw("PS512"),
        kw("RS256"),
        kw("RS384"),
        kw("RS512"),
      ),

    permissions: ($) =>
      prec.right(
        seq(
          kw("PERMISSIONS"),
          choice(
            kw("NONE"),
            kw("FULL"),
            seperatedList1(",", $.permissions_specific),
          ),
        ),
      ),

    view: ($) => choice($.view_select, seq("(", $.view_select, ")")),

    index: ($) =>
      choice(
        kw("UNIQUE"),
        seq(
          kw("SEARCH"),
          optional($.analyzer),
          $.scoring,
          $.search_order,
          optional(kw("HIGHLIGHTS")),
        ),
        seq(
          kw("MTREE"),
          $.dimension,
          optional($.distance),
          optional($.capacity),
          optional($.doc_ids_order),
        ),
      ),

    dir: ($) => choice("<-", "<->", "->"),

    custom_graph: ($) =>
      choice(
        seq("?", optional($.condition), optional(seq(kw("AS"), $.plain_idiom))),
        seq(
          seperatedList1(",", $.identifier),
          optional($.condition),
          optional(seq(kw("AS"), $.plain_idiom)),
        ),
      ),

    idiom_bracket_value: ($) => choice($.strand, $.param, $.basic_idiom),

    sub_query_statement: ($) =>
      choice(
        $.return_statement,
        $.select_statement,
        $.create_statement,
        $.delete_statement,
        $.relate_statement,
        $.insert_statement,
        $.define_statement,
        $.remove_statement,
      ),

    order: ($) =>
      seq(
        $.basic_idiom,
        optional(kw("COLLATE")),
        optional(kw("NUMERIC")),
        optional($.order_direction),
      ),

    thing_or_range: ($) =>
      seq(
        $.identifier,
        ":",
        choice(
          seq(">", $.thing_id, "..", optional("="), $.thing_id),
          seq($.thing_id, optional(seq("..", optional("="), $.thing_id))),
        ),
      ),

    inner_kind: ($) =>
      choice(
        "any",
        seq("option", "<", $.concrete_kind_list, ">"),
        $.concrete_kind_list,
      ),

    view_select: ($) =>
      prec.right(
        seq(
          kw("SELECT"),
          $.fields,
          kw("FROM"),
          seperatedList1(",", $.identifier),
          optional($.condition),
          optional($.group),
        ),
      ),

    analyzer: ($) => seq(kw("ANALYZER"), $.identifier),

    scoring: ($) =>
      choice(kw("VS"), seq(kw("BM25"), optional(seq($.number, ",", $.number)))),

    dimension: ($) => seq(kw("DIMENSION"), $.integer),

    distance: ($) =>
      seq(
        $.distance_keyword,
        choice(
          kw("EUCLIDEAN"),
          kw("MANHATTAN"),
          kw("COSINE"),
          kw("HAMMING"),
          kw("MAHALANOBIS"),
          seq(kw("MINKOWSKI"), $.integer),
        ),
      ),
    capacity: ($) => seq(kw("CAPACITY"), $.integer),
    doc_ids_order: ($) => seq(kw("DOC_IDS_ORDER"), $.integer),

    filter: ($) =>
      choice(
        kw("ASCII"),
        kw("LOWERCASE"),
        kw("UPPERCASE"),
        $.edgen_gram,
        $.n_gram,
        $.snowball,
      ),

    tokenizer: ($) =>
      choice(kw("BLANK"), kw("CAMEL"), kw("CLASS"), kw("PUNCT")),

    order_direction: ($) =>
      choice(kw("ASCENDING"), kw("ASC"), kw("DESCENDING"), kw("DESC")),

    thing_id: ($) => choice($.integer, $.identifier, $.object, $.array),

    concrete_kind_list: ($) => seperatedList1("|", $.concrete_kind),

    permissions_specific: ($) =>
      seq(kw("FOR"), $.permissions_specific_kind, $.permission_value),

    distance_keyword: ($) => choice(kw("DIST"), kw("DISTANCE")),

    edgen_gram: ($) =>
      seq(kw("EDGENGRAM"), "(", $.integer, ",", $.integer, ")"),

    n_gram: ($) => seq(kw("NGRAM"), "(", $.integer, ",", $.integer, ")"),

    snowball: ($) => seq(kw("SNOWBALL"), "(", $.language, ")"),

    concrete_kind: ($) =>
      choice(
        "bool",
        "null",
        "bytes",
        "datetime",
        "decimal",
        "duration",
        "float",
        "int",
        "number",
        "object",
        "point",
        "string",
        "uuid",
        seq("record", $.record_kind_tail),
        seq("geometry", "<", $.geometry_kind_list, ">"),
        seq("array", "<", $.inner_kind, optional(seq(",", $.integer)), ">"),
        seq("set", "<", $.inner_kind, optional(seq(",", $.integer)), ">"),
      ),

    permissions_specific_kind: ($) =>
      choice(kw("SELECT"), kw("CREATE"), kw("UPDATE"), kw("DELETE")),

    language: ($) =>
      choice(
        kw("ARABIC"),
        kw("ARA"),
        kw("AR"),
        kw("DANISH"),
        kw("DAN"),
        kw("DA"),
        kw("DUTCH"),
        kw("NLD"),
        kw("NL"),
        kw("ENGLISH"),
        kw("ENG"),
        kw("EN"),
        kw("FRENCH"),
        kw("FRA"),
        kw("FR"),
        kw("GERMAN"),
        kw("DEU"),
        kw("DE"),
        kw("GREEK"),
        kw("ELL"),
        kw("EL"),
        kw("HUNGARIAN"),
        kw("HUN"),
        kw("HU"),
        kw("ITALIAN"),
        kw("ITA"),
        kw("IT"),
        kw("NORWEGIAN"),
        kw("NOR"),
        kw("NO"),
        kw("PORTUGUESE"),
        kw("POR"),
        kw("PT"),
        kw("ROMANIAN"),
        kw("RON"),
        kw("RO"),
        kw("RUSSIAN"),
        kw("RUS"),
        kw("RU"),
        kw("SPANISH"),
        kw("SPA"),
        kw("ES"),
        kw("SWEDISH"),
        kw("SWE"),
        kw("SV"),
        kw("TAMIL"),
        kw("TAM"),
        kw("TA"),
        kw("TURKISH"),
        kw("TUR"),
        kw("TR"),
      ),

    unary_expression: ($) =>
      choice(
        prec(2, $.primary_expression),
        prec(1, $.idiom_expression),
        seq("-", $.unary_expression),
        seq("+", $.unary_expression),
        seq("!", $.unary_expression),
        seq(
          /* LOOKAHEAD(1) =/= [Leaf { case_sensitive: false, value: "FUTURE" }] */
          $.kind,
          $.unary_expression,
        ),
      ),

    record_kind_tail: ($) =>
      choice(
        seq("(", seperatedList1(",", $.identifier), ")"),
        seq("<", seperatedList1("|", $.identifier), ">"),
      ),

    geometry_kind_list: ($) => seperatedList1("|", $.geometry_kind),

    primary_expression: ($) =>
      choice(
        kw("NONE"),
        kw("NULL"),
        kw("TRUE"),
        kw("FALSE"),
        $.future,
        $.strand,
        //   TODO: $.script_function,
      ),

    idiom_expression: ($) =>
      prec.right(
        seq($.idiom_primary_expression, repeat($.idiom_expression_tail)),
      ),

    idiom_expression_tail: ($) =>
      choice(
        "...",
        $.graph,
        seq(".", $.idiom_dot),
        seq("[", $.idiom_bracket, "]"),
      ),

    geometry_kind: ($) =>
      choice(
        "feature",
        "point",
        "line",
        "polygon",
        "multipoint",
        "multiline",
        "multipolygon",
        "collection",
      ),

    idiom_primary_expression: ($) =>
      choice(
        prec(3, $.graph),
        prec(3, $.array),
        prec(3, $.param),
        prec(3, $.mock),
        prec(3, $.duration),
        prec(3, $.number),
        prec.right(3, $.sub_query),
        $.path_like,
        $.object_like,
        // TODO: $.regex,
        $.date_time,
        prec(2, $.thing_or_range),
        /* LOOKAHEAD(1) =/= [Leaf { case_sensitive: true, value: ":" }, Leaf { case_sensitive: true, value: "::" }] */
        /* LOOKAHEAD(0) =/= [Production { name: "ValueKeyword" }, Production { name: "SubQueryKeyword" }] */
        prec(1, $.identifier),
      ),

    mock: ($) =>
      seq(
        "|",
        $.identifier,
        ":",
        $.integer,
        optional(seq("..", $.integer)),
        "|",
      ),

    search_order: ($) =>
      choice(
        seq("ORDER", repeat1($.search_order_value)),
        $.doc_ids_order,
        $.doc_lengths_order,
        $.postings_order,
        $.terms_order,
      ),

    search_order_value: ($) =>
      choice(
        seq("IDS", $.integer),
        seq("LENGTHS", $.integer),
        seq("POSTINGS", $.integer),
        seq("TERMS", $.integer),
      ),

    doc_lengths_order: ($) => seq(kw("DOC_LENGTHS_ORDER"), $.integer),
    postings_order: ($) => seq(kw("POSTINGS_ORDER"), $.integer),
    terms_order: ($) => seq(kw("TERMS_ORDER"), $.integer),

    output_keyword: ($) =>
      choice(kw("NONE"), kw("NULL"), kw("DIFF"), kw("AFTER"), kw("BEFORE")),

    identifier: ($) => $.raw_identifier,

    raw_identifier: ($) =>
      token(
        choice(
          /[a-zA-Z_][a-zA-Z0-9_]*/,
          seq("`", /[^`]*/, "`"),
          seq("⟨", /[^⟩]*/, "⟩"),
        ),
      ),

    comment_token: ($) =>
      token(
        choice(
          seq("//", /.*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "*/"),
          seq("--", /.*/),
        ),
      ),

    uuid: ($) => token('u"', /[^"]/, '"'),
  },
});
