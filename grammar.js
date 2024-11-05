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
    throw new Error(`Expected uppercase keyword got ${keyword}`);
  }

  const words = keyword.split(" ");
  if (words.length != 1) {
    throw new Error("Expected single,unspaced keyword");
  }
  const regExps = caseInsensitiveRegex(words[0]);
  return alias(token(prec(5, regExps)), "KW");
};

const likeKw = (keyword) => {
  if (keyword.toUpperCase() != keyword) {
    throw new Error("Expected uppercase keyword got ${keyword}");
  }

  const words = keyword.split(" ");
  if (words.length != 1) {
    throw new Error("Expected single,unspaced keyword");
  }
  const regExps = caseInsensitiveRegex(words[0]);
  return alias(token(prec(5, regExps)), "LIKEKW");
};

const seperatedList0 = (by, parser) => optional(seperatedList1(by, parser));
const seperatedList1 = (by, parser) => seq(parser, repeat(seq(by, parser)));
const trailingList0 = (by, parser) => optional(trailingList1(by, parser));
const trailingList1 = (by, parser) =>
  seq(seperatedList1(by, parser), optional(by));

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

const buildPrecedence = function (p) {
  let res = {};
  let i = 0;
  for (let prec of p) {
    res[prec] = i++;
  }

  return Object.freeze(res);
};

RegExp.prototype.or = function (other) {
  return new RegExp(`(?:${this.source})|(?:${other.source})`);
};

RegExp.prototype.then = function (other) {
  return new RegExp(`(?:${this.source})(?:${other.source})`);
};

RegExp.prototype.optional = function () {
  return new RegExp(`(?:${this.source})?`);
};
RegExp.prototype.many = function () {
  return new RegExp(`(?:${this.source})*`);
};
RegExp.prototype.atleastOne = function () {
  return new RegExp(`(?:${this.source})+`);
};

const DIGIT = /[0-9]/;
const OPT_DIGIT = DIGIT.optional();
const SIGN = /[+\-]?/;
const TWO_DIGITS = DIGIT.then(DIGIT);

const DATE_TIME_YEAR = DIGIT.then(DIGIT).then(DIGIT).then(DIGIT);
const DATE_TIME_NANOS = DIGIT.then(OPT_DIGIT)
  .then(OPT_DIGIT)
  .then(OPT_DIGIT)
  .then(OPT_DIGIT)
  .then(OPT_DIGIT)
  .then(OPT_DIGIT)
  .then(OPT_DIGIT)
  .then(OPT_DIGIT);

const DATE_TIME_ZONE = /Z/.or(
  /[+\-]/.then(TWO_DIGITS).then(/:/).then(TWO_DIGITS),
);
const DATE_TIME_FULL = DATE_TIME_YEAR.then(/-/)
  .then(TWO_DIGITS)
  .then(/-/)
  .then(TWO_DIGITS)
  .then(/T/)
  .then(TWO_DIGITS)
  .then(/:/)
  .then(TWO_DIGITS)
  .then(/:/)
  .then(TWO_DIGITS)
  .then(/\./.then(DATE_TIME_NANOS).optional())
  .then(DATE_TIME_ZONE);

const HEX_DIGIT = /[0-9a-fA-F]/;
const HEX_DIGIT_4 = HEX_DIGIT.then(HEX_DIGIT).then(HEX_DIGIT).then(HEX_DIGIT);
const HEX_DIGIT_8 = HEX_DIGIT_4.then(HEX_DIGIT_4);
const HEX_DIGIT_12 = HEX_DIGIT_8.then(HEX_DIGIT_4);
const UUID = HEX_DIGIT_8.then(/-/)
  .then(HEX_DIGIT_4)
  .then(/-/)
  .then(HEX_DIGIT_4)
  .then(/-/)
  .then(HEX_DIGIT_4)
  .then(/-/)
  .then(HEX_DIGIT_12);

const INTEGER = SIGN.optional().then(DIGIT.atleastOne());
const DIGITS_AND_UNDERSCORE = DIGIT.then(DIGIT.or(/_/).many());

const NUMERIC = SIGN.optional()
  .then(DIGITS_AND_UNDERSCORE)
  .then(/\./.then(DIGITS_AND_UNDERSCORE).optional())
  .then(/[eE]/.then(SIGN.optional()).then(DIGITS_AND_UNDERSCORE).optional())
  .then(/dec/.or(/f/).optional());

const IDENT_START_CHARACTER = /[a-zA-Z_]/;
const IDENT_CHARACTER = /[a-zA-Z0-9_]/;

const IDENTIFIER = IDENT_START_CHARACTER.then(IDENT_CHARACTER.many());

const DURATION_SUFFIXES = [
  "ns",
  "µs",
  "us",
  "ms",
  "s",
  "m",
  "h",
  "d",
  "w",
  "y",
];
const DURATION = DIGITS_AND_UNDERSCORE.then(
  new RegExp(DURATION_SUFFIXES.join("|")),
).atleastOne();

const PRECEDENCE = buildPrecedence([
  "CLOSURE",
  "OR",
  "AND",
  "EQUALITY",
  "RELATION",
  "ADD",
  "MUL",
  "POWER",
  "CAST",
  "RANGE",
  "NULLISH",
  "UNARY",
  "DOT",
  "CALL",
  "CLOSURE_RETURN",
  "LET",
  "STMT",
]);

const OR_OPERATOR = ["||", "OR"];
const AND_OPERATOR = ["&&", "AND"];
const EQ_OPERATOR = ["=", "==", "!=", "*=", "?=", "~", "!~", "*~", "?~", "@"];
const RELATION_OPERATOR = [
  ">",
  "<",
  "<=",
  ">=",
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
];

const RELATION_OPERATOR_KEYWORDS = [
  "CONTAINS",
  "CONTAINSNOT",
  "INSIDE",
  "NOTINSIDE",
  "CONTAINSALL",
  "CONTAINSANY",
  "CONTAINSNONE",
  "ALLINSIDE",
  "ANYINSIDE",
  "NONEINSIDE",
  "OUTSIDE",
  "INTERSECTS",
  "NOT",
  "IN",
];

const DISTANCE_KEYWORDS = [
  "CHEBYSHEV",
  "COSINE",
  "EUCLIDEAN",
  "HAMMING",
  "JACCARD",
  "MANHATTAN",
  "MINKOWSKI",
  "PEARSON",
];

const MUL_OPERATORS = ["*", "×", "/", "÷", "%"];

module.exports = grammar({
  name: "surrealql",

  extras: ($) => [
    /\s+/,
    $.doc_single_line_comment,
    $.single_line_comment,
    $.doc_multi_line_comment,
    $.multi_line_comment,
  ],

  word: ($) => $.raw_identifier,

  rules: {
    query: ($) => optional($.statement_list),
    statement_list: ($) =>
      seq(seperatedList1(repeat1(";"), $.statement), repeat(";")),

    statement: ($) =>
      choice(
        $.let_statement,
        $.select_statement,
        $.begin_statement,
        $.commit_statement,
        $.cancel_statement,
        $.break_statement,
        $.continue_statement,
        $.create_statement,
        $.update_statement,
        $.define_statement,
        $.alter_statement,
        $.return_statement,
        $.info_statement,
        $.use_statement,
        $.for_statement,
        $.expression,
      ),

    begin_statement: ($) => seq(kw("BEGIN"), optional(kw("TRANSACTION"))),
    commit_statement: ($) => seq(kw("COMMIT"), optional(kw("TRANSACTION"))),
    cancel_statement: ($) => seq(kw("CANCEL"), optional(kw("TRANSACTION"))),
    break_statement: ($) => kw("BREAK"),
    continue_statement: ($) => kw("CONTINUE"),
    if_statement: ($) => seq(kw("IF"), $.expression, $._if_statement_body),
    _if_statement_body: ($) =>
      choice(
        seq(kw("THEN"), $.expression, repeat(";"), $._worded_if_statement_tail),
        seq(
          $.block,
          repeat(seq(kw("ELSE"), kw("IF"), $.expression, $.block)),
          optional(seq(kw("ELSE"), $.block)),
        ),
      ),
    _worded_if_statement_tail: ($) =>
      seq(
        repeat(
          seq(kw("ELSE"), kw("IF"), $.expression, kw("THEN"), $.expression),
        ),
        optional(seq(kw("ELSE"), $.expression)),
        kw("END"),
      ),

    let_statement: ($) =>
      prec(
        PRECEDENCE.LET,
        seq(optional(kw("LET")), $.param, "=", $.expression),
      ),

    select_statement: ($) =>
      seq(
        kw("SELECT"),
        field("selector", $.selector),
        optional(seq(kw("OMIT"), field("omit", seperatedList1(",", $.idiom)))),
        kw("FROM"),
        optional(kw("ONLY")),
        $.expression_list,
        optional(seq(kw("WHERE"), $.expression)),
        optional(seq(kw("VERSION"), $.datetime_strand)),
        optional(seq(kw("TIMEOUT"), $.duration)),
        optional(kw("PARALLEL")),
        optional(kw("TEMPFILES")),
        optional(seq(kw("EXPLAIN"), optional(kw("FULL")))),
      ),

    selector: ($) =>
      choice(
        seq(kw("VALUE"), $.expression, optional(seq(kw("AS"), $.idiom))),
        seperatedList1(
          ",",
          choice("*", seq($.expression, optional(seq(kw("AS"), $.idiom)))),
        ),
      ),

    alter_statement: ($) =>
      seq(
        kw("ALTER"),
        $._table_kw,
        optional(seq(kw("IF"), kw("EXISTS"))),
        $.identifier,
        repeat($.alter_statement_clauses),
      ),
    alter_statement_clauses: ($) =>
      choice(
        seq(kw("DROP"), optional($.boolean)),
        kw("SCHEMALESS"),
        kw("SCHEMAFULL"),
        kw("SCHEMAFUL"),
        $._comment_clause,
        $._type_clause,
        $._changefeed_clause,
      ),

    return_statement: ($) => seq(kw("RETURN"), $._expression_and_statements),

    info_statement: ($) =>
      seq(
        kw("INFO"),
        kw("FOR"),
        choice(
          kw("ROOT"),
          $._namespace_kw,
          $._database_kw,
          seq($._table_kw, $.identifier),
          seq(kw("USER"), $.identifier, optional(seq(kw("ON"), $.base))),
          seq(
            kw("INDEX"),
            $.identifier,
            kw("ON"),
            optional($._table_kw),
            $.identifier,
          ),
        ),
      ),

    use_statement: ($) =>
      seq(
        kw("USE"),
        choice(
          seq(
            choice(kw("NAMESPACE"), kw("NS")),
            $.identifier,
            optional(seq(choice(kw("DATABASE"), kw("DB")), $.identifier)),
          ),
          seq(choice(kw("DATABASE"), kw("DB")), $.identifier),
        ),
      ),

    for_statement: ($) =>
      seq(kw("FOR"), $.param, kw("IN"), $.expression, $.block),

    create_statement: ($) =>
      seq(
        kw("CREATE"),
        optional(kw("ONLY")),
        $.expression_list,
        optional($._data_clause),
        optional($._output_clause),
        optional($._version_clause),
        optional($._timeout_clause),
        optional(kw("PARALLEL")),
      ),

    update_statement: ($) =>
      seq(
        kw("UPDATE"),
        optional(kw("ONLY")),
        $.expression_list,
        optional($._data_clause),
        optional($._condition_clause),
        optional($._output_clause),
        optional($._timeout_clause),
        optional(kw("PARALLEL")),
      ),

    define_statement: ($) =>
      seq(
        kw("DEFINE"),
        choice(
          seq(
            $._namespace_kw,
            optional($._if_not_exists_clause),
            repeat($._comment_clause),
          ),
          seq(
            $._database_kw,
            optional($._if_not_exists_clause),
            repeat($._comment_clause),
          ),
          $.define_table_statement,
          $.define_function_statement,
        ),
      ),

    define_function_statement: ($) =>
      seq(
        kw("FUNCTION"),
        optional($._if_not_exists_clause),
        $.defined_function_name,
        "(",
        trailingList0(",", seq($.param, ":", $.kind)),
        ")",
        optional(seq("->", $.kind)),
        $.block,
        repeat(choice($._comment_clause, $._simple_permissions_clause)),
      ),

    define_user_statement: ($) =>
      seq(
        kw("USER"),
        optional($._if_not_exists_clause),
        $.identifier,
        kw("ON"),
        $.base,
        repeat(
          choice(
            $._comment_clause,
            seq(kw("PASSWORD"), $.plain_strand),
            seq(kw("PASSHASH"), $.plain_strand),
            seq(kw("ROLES"), seperatedList1(",", $.identifier)),
            seq(
              kw("DURATION"),
              repeat(
                seq(
                  kw("FOR"),
                  choice(kw("TOKEN"), kw("SESSION")),
                  choice(kw("NONE"), $.duration),
                ),
              ),
            ),
          ),
        ),
      ),

    define_table_statement: ($) =>
      seq(
        $._table_kw,
        optional($._if_not_exists_clause),
        $.identifier,
        repeat(
          choice(
            $._comment_clause,
            kw("DROP"),
            $._type_clause,
            $._changefeed_clause,
          ),
        ),
      ),

    _namespace_kw: ($) => choice(kw("NAMESPACE"), kw("NS")),
    _database_kw: ($) => choice(kw("DATABASE"), kw("DB")),
    _table_kw: ($) => choice(kw("TABLE"), kw("TB")),

    _data_clause: ($) =>
      choice(
        seq(
          kw("SET"),
          seperatedList1(",", seq($.idiom, $.assign_operator, $.expression)),
        ),
        seq(kw("UNSET"), seperatedList1(",", $.idiom)),
        seq(kw("PATCH"), seperatedList1(",", $.expression)),
        seq(kw("MERGE"), seperatedList1(",", $.expression)),
        seq(kw("REPLACE"), seperatedList1(",", $.expression)),
        seq(kw("CONTENT"), seperatedList1(",", $.expression)),
      ),
    _output_clause: ($) =>
      choice(
        prec(PRECEDENCE.STMT,kw("NONE")),
        prec(PRECEDENCE.STMT,kw("NULL")),
        kw("DIFF"),
        kw("AFTER"),
        kw("BEFORE"),
        $.selector,
      ),
    _timeout_clause: ($) => seq(kw("TIMEOUT"), $.duration),
    _version_clause: ($) => seq(kw("VERSION"), $.datetime_strand),
    _condition_clause: ($) => seq(kw("WHERE"), $.expression),

    _if_not_exists_clause: ($) =>
      choice(seq(kw("IF"), kw("NOT"), kw("EXISTS")), kw("OVERWRITE")),
    _comment_clause: ($) =>
      seq(kw("COMMENT"), choice(kw("NONE"), $.plain_strand)),
    _type_clause: ($) =>
      seq(kw("TYPE"), choice(kw("NORMAL"), kw("RELATION"), kw("ANY"))),
    _changefeed_clause: ($) =>
      seq(kw("CHANGEFEED"), choice(kw("NONE"), $._changefeed_clause_tail)),
    _changefeed_clause_tail: ($) =>
      seq($.duration, optional(seq(kw("INCLUDE"), kw("ORIGINAL")))),
    _simple_permissions_clause: ($) =>
      seq(
        kw("PERMISSIONS"),
        choice(kw("NONE"), kw("FULL"), seq(kw("WHERE"), $.expression)),
      ),

    defined_function_name: ($) =>
      seq(likeKw("FN"), "::", seperatedList1("::", $.identifier)),
    builtin_function_name: ($) => seperatedList1("::", $.identifier),

    base: ($) =>
      choice(kw("ROOT"), kw("NAMESPACE"), kw("NS"), kw("DATABASE"), kw("DB")),
    base_with_scope: ($) =>
      choice(
        kw("ROOT"),
        kw("NAMESPACE"),
        kw("NS"),
        kw("DATABASE"),
        kw("DB"),
        seq(kw("SCOPE"), $.identifier),
      ),

    kind: ($) =>
      prec.left(
        choice(
          likeKw("ANY"),
          seq(likeKw("OPTION"), "<", $._concrete_kind, ">"),
          seperatedList1("|", $._concrete_kind),
        ),
      ),

    _concrete_kind: ($) =>
      prec.left(
        choice(
          likeKw("BOOL"),
          likeKw("NULL"),
          likeKw("BYTES"),
          likeKw("DATETIME"),
          likeKw("DECIMAL"),
          likeKw("DURATION"),
          likeKw("FLOAT"),
          likeKw("INT"),
          likeKw("NUMBER"),
          likeKw("OBJECT"),
          likeKw("POINT"),
          likeKw("STRING"),
          likeKw("UUID"),
          likeKw("RANGE"),
          likeKw("FUNCTION"),
          seq(
            likeKw("RECORD"),
            optional(seq("<", seperatedList1("|", $.identifier), ">")),
          ),
          seq(
            likeKw("GEOMETRY"),
            optional(seq("<", seperatedList1("|", $._geometry_kind), ">")),
          ),
          seq(
            likeKw("ARRAY"),
            optional(seq("<", $.kind, optional(seq(",", $.integer)), ">")),
          ),
          seq(
            likeKw("SET"),
            optional(seq("<", $.kind, optional(seq(",", $.integer)), ">")),
          ),
          $.number,
          $.duration,
          $.plain_strand,
          $.literal_object_kind,
          $.literal_array_kind,
        ),
      ),

    _geometry_kind: ($) =>
      choice(
        likeKw("FEATURE"),
        likeKw("LINE"),
        likeKw("POINT"),
        likeKw("POLYGON"),
        likeKw("MULTIPOINT"),
        likeKw("MULTILINE"),
        likeKw("MULTIPOLYGON"),
        likeKw("COLLECTION"),
      ),

    literal_object_kind: ($) =>
      seq("{", trailingList0(",", seq($.object_key, ":", $.kind)), "}"),

    literal_array_kind: ($) => seq("[", trailingList0(",", $.kind), "]"),

    expression_list: ($) => seperatedList1(",", $.expression),

    _expression_and_statements: ($) =>
      choice($.select_statement, $.if_statement, $.expression),

    expression: ($) =>
      choice(
        $.unary_expression,
        $.binary_expression,
        $._local_operator,
        prec.left(PRECEDENCE.CLOSURE, $.closure),
      ),

    unary_expression: ($) =>
      choice(
        prec.left(PRECEDENCE.UNARY, seq($.prefix_operator, $.expression)),
        prec.left(PRECEDENCE.CAST, seq($.cast_operator, $.expression)),
      ),

    binary_expression: ($) =>
      choice(
        prec.left(
          PRECEDENCE.OR,
          seq($.expression, $.or_operator, $.expression),
        ),
        prec.left(
          PRECEDENCE.AND,
          seq($.expression, $.and_operator, $.expression),
        ),
        prec.left(
          PRECEDENCE.RELATION,
          seq($.expression, $.relation_operator, $.expression),
        ),
        prec.left(
          PRECEDENCE.EQUALITY,
          seq($.expression, $.eq_operator, $.expression),
        ),
        prec.left(PRECEDENCE.POWER, seq($.expression, "**", $.expression)),
        prec.left(
          PRECEDENCE.MUL,
          seq($.expression, $.mull_operator, $.expression),
        ),
        prec.left(
          PRECEDENCE.ADD,
          seq($.expression, $.add_operator, $.expression),
        ),
        prec.left(
          PRECEDENCE.RANGE,
          seq($.expression, $.range_operator, $.expression),
        ),
      ),

    _local_operator: ($) =>
      choice(
        prec.left(PRECEDENCE.DOT, seq($.expression, "...")),
        prec.left(PRECEDENCE.DOT, seq($.expression, $.dot_operator)),
        prec.left(PRECEDENCE.DOT, seq($.expression, $.index_operator)),
        prec.left(PRECEDENCE.DOT, seq($.expression, $.graph_operator)),
        prec.left(PRECEDENCE.DOT, seq($.prefix_operator, $.expression)),
        $.object_literal,
        $.array_literal,
        $.number,
        $.boolean,
        $.duration,
        $.null,
        $.none,
        $.strand_like,
        $._path_like,
        $.param,
        $.record_id,
        seq("(", $.covered_expression, ")"),
      ),

    _path_like: ($) =>
      choice($.defined_function, $.builtin_function, $.builtin_constant),

    defined_function: ($) =>
      seq(
        likeKw("FN"),
        "::",
        seperatedList1("::", $.identifier),
        $.call_operator,
      ),
    builtin_function: ($) =>
      choice(
        seq($._identifier_path, $.call_operator),
        seq($.identifier, $.call_operator),
      ),
    builtin_constant: ($) => prec.left($._identifier_path),

    _identifier_path: ($) =>
      seq($.identifier, "::", seperatedList1("::", $.identifier)),

    covered_expression: ($) =>
      choice(
        $.expression,
        $.if_statement,
        $.select_statement,
        $.create_statement,
        $.update_statement,
      ),

    cast_operator: ($) => seq("<", $.kind, ">"),

    idiom: ($) =>
      prec.left(seq(
        optional($.prefix_operator),
        $.identifier,
        repeat(choice($.dot_operator, $.index_operator)),
      )),

    graph_operator: ($) => seq($.graph_operator_token, $.identifier),

    dot_operator: ($) =>
      prec.left(seq(
        ".",
        choice(
          seq($.identifier, $.call_operator),
          $.destructure_operator,
          $.identifier,
          "*",
        ),
      )),

    index_operator: ($) =>
      seq(
        "[",
        choice(
          "*",
          "$",
          seq(choice("?", kw("WHERE")), $.expression),
          $.expression,
        ),
        "]",
      ),

    call_operator: ($) => seq("(", trailingList0(",", $.expression), ")"),

    destructure_operator: ($) =>
      seq("{", trailingList0(",", $.destructure_field), "}"),

    destructure_field: ($) =>
      seq(
        $.identifier,
        optional(
          choice(
            seq(":", $.identifier, repeat($.dot_operator)),
            $.dot_operator,
          ),
        ),
      ),

    range_operator: ($) => choice(">..", "..", "..=", ">..="),
    prefix_operator: ($) => choice("-", "+", "!", $.graph_operator_token),
    or_operator: ($) => choice("||", likeKw("OR")),
    and_operator: ($) => choice("&&", likeKw("AND")),
    eq_operator: ($) => choice(...EQ_OPERATOR, likeKw("IS")),
    add_operator: ($) => choice("+", "-"),
    mull_operator: ($) => choice("*", "/", "×", "÷", "%"),
    relation_operator: ($) =>
      choice(
        ...RELATION_OPERATOR,
        ...RELATION_OPERATOR_KEYWORDS.map(kw),
        $.knn_operator,
      ),
    knn_operator: ($) =>
      seq(
        "<|",
        $.integer,
        optional(seq(",", choice($.integer, $.distance))),
        "|>",
      ),

    prefix_operator: ($) => choice("..", "..=", "<-", "<->", "->"),

    assign_operator: ($) => choice("=", "+=", "-=", "+?="),

    closure: ($) =>
      seq(
        $._closure_arguments,
        choice(
          prec(PRECEDENCE.CLOSURE_RETURN, seq("->", $.kind, $.block)),
          $.expression,
        ),
      ),
    _closure_arguments: ($) =>
      prec.left(
        seq(
          "|",
          seperatedList0(",", $.argument),
          "|",
          optional(seq("->", $.kind)),
        ),
      ),

    graph_operator_token: ($) => choice("<-", "<->", "->"),

    argument: ($) => seq($.param, optional(seq(":", $.kind))),

    distance: ($) => choice(...DISTANCE_KEYWORDS.map(kw)),

    block: ($) =>
      seq(
        "{",
        $._block_body,
        repeat(seq(repeat1(";"), $._block_body)),
        repeat(";"),
        "}",
      ),
    _block_body: ($) =>
      choice(
        $.let_statement,
        $.if_statement,
        $.select_statement,
        $.for_statement,
        $.break_statement,
        $.continue_statement,
        $.create_statement,
        $.update_statement,
        $.return_statement,
        $.expression,
      ),

    record_id: ($) => seq($.identifier, ":", $.record_id_key),

    record_id_key: ($) =>
      choice(
        $.integer,
        $.uuid_strand,
        $.array_literal,
        $.object_literal,
        $.flexible_identifier,
      ),

    array_literal: ($) => seq("[", trailingList0(",", $.expression), "]"),
    object_literal: ($) => seq("{", trailingList0(",", $._object_field), "}"),
    _object_field: ($) =>
      seq(field("key", $.object_key), ":", field("value", $.expression)),
    object_key: ($) => choice($.identifier, $.plain_strand, $.number),

    duration: ($) => DURATION,
    null: ($) => likeKw("NULL"),
    none: ($) => likeKw("NONE"),
    boolean: ($) => choice(likeKw("TRUE"), likeKw("FALSE")),
    number: ($) => NUMERIC,
    integer: ($) => INTEGER,

    strand_like: ($) =>
      choice(
        prec(2, $.record_strand),
        prec(2, $.datetime_strand),
        prec(2, $.uuid_strand),
        $.plain_strand,
      ),

    comment: ($) => choice($.multi_line_comment, $.single_line_comment),

    doc_single_line_comment: ($) => token(prec(1, seq("///", /.*/))),

    single_line_comment: ($) =>
      token(prec(1, seq(choice("//", "#", "--"), /.*/))),

    doc_multi_line_comment: ($) =>
      token(prec(2, seq("/**", field("doc", /[^*]*\*+([^/*][^*]*\*+)*/), "/"))),

    multi_line_comment: ($) =>
      token(prec(1, seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"))),

    plain_strand: ($) =>
      choice(
        seq('"', repeat($._strand_content_double), '"'),
        seq("'", repeat($._strand_content_single), "'"),
        seq('s"', repeat($._strand_content_double), '"'),
        seq("s'", repeat($._strand_content_single), "'"),
      ),
    record_strand: ($) =>
      choice(
        seq('r"', repeat($._strand_content_double), '"'),
        seq("r'", repeat($._strand_content_single), "'"),
      ),
    datetime_strand: ($) =>
      choice(seq('d"', DATE_TIME_FULL, '"'), seq("d'", DATE_TIME_FULL, "'")),
    uuid_strand: ($) => choice(seq('u"', UUID, '"'), seq("u'", UUID, "'")),

    _strand_content_double: ($) => choice(/[^"\\]/, /\\[bfnrt\\'"]/),

    _strand_content_single: ($) => choice(/[^'\\]/, /\\[bfnrt\\'"]/),

    identifier: ($) =>
      choice($.raw_identifier, $.bracket_identifier, $.backtick_identifier),
    flexible_identifier: ($) =>
      choice(/[a-zA-Z0-9_]+/, $.bracket_identifier, $.backtick_identifier),
    raw_identifier: ($) => IDENTIFIER,

    bracket_identifier: ($) =>
      token(seq("⟨", token.immediate(/[^⟩]*/), token.immediate("⟩"))),
    backtick_identifier: ($) =>
      token(seq("`", token.immediate(/[^`]*/), token.immediate("`"))),

    param: ($) => choice($._raw_param, $._bracket_param, $._backtick_param),

    _raw_param: ($) => token(seq("$", token.immediate(IDENTIFIER))),
    _bracket_param: ($) =>
      token(seq("$⟨", token.immediate(/[^⟩]*/), token.immediate("⟩"))),
    _backtick_param: ($) =>
      token(seq("$`", token.immediate(/[^`]*/), token.immediate("`"))),
  },
});
