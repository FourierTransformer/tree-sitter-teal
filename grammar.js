
const list = (item) => seq(item, repeat(seq(",", item)))
const prec_op = {
  or: 1,
  and: 2,
  is: 3,
  comp: 4,
  bor: 5,
  bnot: 6,
  band: 7,
  bshift: 8,
  concat: 9,
  plus: 10,
  mult: 11,
  unary: 12,
  power: 13,

  as: 100,
}

module.exports = grammar({
  name: 'Teal',

  conflicts: $ => [
    [$.table_constructor],
    [$.type_annotation, $._type],
    [$.type_annotation],
    [$._type],
    [$.function_type]
  ],

  rules: {
    program: $ => repeat($._statement),
    _statement: $ => choice(
      $.var_declaration,
      $.function_declaration,
      $.retstat
    ),

    retstat: $ => seq('return', optional(list($._expression))),

    _expression: $ => choice(
      $.identifier,
      $.number,
      $.string,
      $.table_constructor,
      $.anon_function,
      $.bin_op,
      $.unary_op
    ),

    unary_op: $ => prec.left(prec_op.unary, seq(
      choice('not', '#', '-', '~'),
      $._expression
    )),

    bin_op: $ => choice(
      ...[
        ['or', 'or', prec_op.or],
        ['and', 'and', prec_op.and],
        ['lt', '<', prec_op.comp],
        ['le', '<=', prec_op.comp],
        ['eq', '==', prec_op.comp],
        ['ne', '~=', prec_op.comp],
        ['ge', '>=', prec_op.comp],
        ['gt', '>', prec_op.comp],
        ['bor', '|', prec_op.bor],
        ['bnot', '~', prec_op.bnot],
        ['band', '&', prec_op.band],
        ['bls', '<<', prec_op.bshift],
        ['brs', '>>', prec_op.bshift],
        ['add', '+', prec_op.plus],
        ['sub', '-', prec_op.plus],
        ['mul', '*', prec_op.mult],
        ['div', '/', prec_op.mult],
        ['idiv', '//', prec_op.mult],
        ['mod', '%', prec_op.mult],
      ].map(([name, operator, precedence]) => prec.left(precedence, seq(
        $._expression,
        field(name + '_op', operator),
        $._expression
      ))),
      ...[
        ['concat', '..', prec_op.concat],
        ['pow', '^', prec_op.power],
      ].map(([name, operator, precedence]) => prec.right(precedence, seq(
        $._expression,
        field(name + '_op', operator),
        $._expression
      ))),
      ...[
        ['is', prec_op.is],
        ['as', prec_op.as]
      ].map(([operator, precedence]) => prec.right(precedence, seq(
        $._expression,
        field(operator + '_op', operator),
        $._type
      )))
    ),

    var_declaration: $ => seq(
      choice("local", "global"),
      $.identifier,
      repeat(seq(
        ",",
        $.identifier
      )),
      optional($.type_annotation),
      optional(seq("=", list($._expression)))
    ),

    table_constructor: $ => seq(
      "{",
      repeat(
        choice(
          seq(
            $._expression,
            repeat(seq(
              choice(";", ","),
              $._expression
            )),
            optional(choice(";", ","))
          ),
          seq(
            field("table_key", $.identifier),
            "=",
            $._expression,
            optional(choice(";", ","))
          ),
          seq(
            "[", field("table_expr_key", $._expression), "]",
            "=",
            $._expression,
            optional(choice(";", ","))
          )
        )
      ),
      "}"
    ),

    function_declaration: $ => seq(
      choice("local", "global"),
      "function",
      field("function_name", $.identifier),
      "(",
      optional(seq(
        field("arg", $.identifier),
        repeat(seq(",", $.identifier))
      )),
      ")",
      repeat($._statement),
      "end"
    ),

    anon_function: $ => seq(
      "function",
      "(",
      optional(seq(
        field("arg", $.identifier),
        repeat(seq(",", $.identifier))
      )),
      ")",
      repeat($._statement),
      "end"
    ),

    type_annotation: $ => seq(
      ":",
      // optional("("), //TODO: how to do optional pairs?
      list($._type)
      // optional(")")
    ),

    _type: $ => seq(
      choice(
        $.simple_type,
        $.table_type,
        $.function_type
      ),
      repeat(seq(
        "|", choice($.simple_type, $.table_type, $.function_type)
      ))
    ),

    simple_type: $ => alias(seq(
      $.identifier, repeat(seq(".", $.identifier)),
    ), 'simple_type'),

    table_type: $ => choice(
      seq( // array
        "{",
        field('value_type', $._type),
        "}"
      ),
      seq( // map
        "{",
        field('key_type', $._type),
        ":",
        field('value_type', $._type),
        "}"
      )
    ),

    function_type: $ => seq(
      "function",
      // TODO: generics
      "(",
      optional(list(field("arg_type", $._type))), // TODO: named args in types: foo: function(a: string, b: number)
      ")",
      optional(seq(
        ":",
        list(field("ret_type", $._type))
      ))
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z_0-9]*/,
    number: $ => /\d+/, //TODO: hex and stuff
    string: $ => /"[^"]*"/ //TODO: [==[multiline strings]==] externally, 'single quote strings'

  }
})
