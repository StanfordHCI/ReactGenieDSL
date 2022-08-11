{
  const DEBUGGING = false;
  const debug = (...args) => {
    if (DEBUGGING) {
      console.log('DEBUG: ' + args)
    }
  }
}

top = value / all_symbol

all_symbol =  s:(index_symbol) l:('.' all_symbol)?  {
    if (l !== null) {
        var last_l_parent = null;
        l = l[1];
        var l_parent = l;
        while (l_parent.parent !== undefined) {
            last_l_parent = l_parent;
            l_parent = l_parent.parent;
        }
        if (last_l_parent !== null) {
            last_l_parent.parent = {
                type: "access",
                parent: s,
                access: l_parent
            };
        } else {
            l = {
                type: "access",
                parent: s,
                access: l_parent
            }
        }
        return l;
    } else {
        return s;
    }
}

index_symbol = p: (function_call / symbol) i: ('[' int_literal ']')? {
    if (i !== null) {
        return {
            type: "index",
            parent: p,
            index: i[1]
        };
    } else {
        return p;
    }
}

function_call = func_name:symbol SP* '(' SP* pl:(parameter_list)? SP* ')' {
    debug('function_call', func_name, pl);
    return {
        type: 'function_call',
        func_name: func_name,
        parameters: pl !== null ? pl.parameters : null
    };
}

parameter_list = pp:parameter_pair pl:(SP* ',' SP* parameter_pair)* {
  debug('parameter_list', pp, pl);
  return {"parameters": pl.reduce((acc, cur) => {
    acc.push(cur[3]);
    return acc;
  }, [pp])};
}


parameter_pair = sy:symbol SP* ':' SP* v:value {
	return {"parameter": sy, "value": v};
}

value = 'true' {
    return { type: "boolean", value: true };
} / 'false' {
    return { type: "boolean", value: false };
} / il: int_literal {
	return {"type": "int", "value": il};
} / s: all_symbol {
    return s;
} / '.' s: symbol {
    return {"type": "accessor", "field": s};
} / '"' s: [^"]* '"' {
    return { type: "string", value: s.join("") };
} / '[' SP* s: array_value SP* ']' {
    return { type: "array", value: s };
}

array_value = vi: value iv:(SP* ',' SP* value)* {
    return iv.reduce((acc, cur) => {
        acc.push(cur[3]);
        return acc;
    }, [vi]);
}

symbol = [a-zA-Z_][a-zA-Z0-9_]* {
    return text();
}

int_literal = s:("+" / "-")? i:[0-9]+ {
    return parseInt(i.join("")) * (s !== "-" ? 1 : -1);
}

INTDIGIT = [1-9]
SIGN = '+' / '-'
DIGIT = [0-9]
SP = [ \t]
