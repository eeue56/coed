export const snapshotFilteredJs = {
    "value": [
        {
            "kind": "ConstStatement",
            "name": "GRID_SIZE",
            "value": {
                "kind": "NumberExpression",
                "value": 40
            }
        },
        {
            "kind": "ConstStatement",
            "name": "GRID_WIDTH",
            "value": {
                "kind": "ObjectMethodCallExpression",
                "object": {
                    "kind": "NameLookupExpression",
                    "name": "Math"
                },
                "method": {
                    "kind": "NameLookupExpression",
                    "name": "floor"
                },
                "arguments": [
                    {
                        "kind": "DivisionExpression",
                        "left": {
                            "kind": "ObjectPropertyExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "window"
                            },
                            "property": {
                                "kind": "NameLookupExpression",
                                "name": "innerWidth"
                            }
                        },
                        "right": {
                            "kind": "NameLookupExpression",
                            "name": "GRID_SIZE"
                        }
                    }
                ]
            }
        },
        {
            "kind": "ConstStatement",
            "name": "GRID_HEIGHT",
            "value": {
                "kind": "ObjectMethodCallExpression",
                "object": {
                    "kind": "NameLookupExpression",
                    "name": "Math"
                },
                "method": {
                    "kind": "NameLookupExpression",
                    "name": "floor"
                },
                "arguments": [
                    {
                        "kind": "DivisionExpression",
                        "left": {
                            "kind": "ObjectPropertyExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "window"
                            },
                            "property": {
                                "kind": "NameLookupExpression",
                                "name": "innerHeight"
                            }
                        },
                        "right": {
                            "kind": "NameLookupExpression",
                            "name": "GRID_SIZE"
                        }
                    }
                ]
            }
        },
        {
            "kind": "LetStatement",
            "name": "playerCol",
            "value": {
                "kind": "ObjectMethodCallExpression",
                "object": {
                    "kind": "NameLookupExpression",
                    "name": "Math"
                },
                "method": {
                    "kind": "NameLookupExpression",
                    "name": "floor"
                },
                "arguments": [
                    {
                        "kind": "DivisionExpression",
                        "left": {
                            "kind": "NameLookupExpression",
                            "name": "GRID_WIDTH"
                        },
                        "right": {
                            "kind": "NumberExpression",
                            "value": 2
                        }
                    }
                ]
            }
        },
        {
            "kind": "LetStatement",
            "name": "playerRow",
            "value": {
                "kind": "ObjectMethodCallExpression",
                "object": {
                    "kind": "NameLookupExpression",
                    "name": "Math"
                },
                "method": {
                    "kind": "NameLookupExpression",
                    "name": "floor"
                },
                "arguments": [
                    {
                        "kind": "DivisionExpression",
                        "left": {
                            "kind": "NameLookupExpression",
                            "name": "GRID_HEIGHT"
                        },
                        "right": {
                            "kind": "NumberExpression",
                            "value": 2
                        }
                    }
                ]
            }
        },
        {
            "kind": "LetStatement",
            "name": "score",
            "value": {
                "kind": "NumberExpression",
                "value": 0
            }
        },
        {
            "kind": "LetStatement",
            "name": "inBattle",
            "value": {
                "kind": "BooleanExpression",
                "value": false
            }
        },
        {
            "kind": "LetStatement",
            "name": "battleState",
            "value": {
                "kind": "ObjectExpression",
                "properties": {}
            }
        },
        {
            "kind": "LetStatement",
            "name": "gridEntities",
            "value": {
                "kind": "ArrayExpression",
                "elements": []
            }
        },
        {
            "kind": "ConstStatement",
            "name": "moves",
            "value": {
                "kind": "ArrayExpression",
                "elements": [
                    {
                        "kind": "ObjectExpression",
                        "properties": {
                            "name": {
                                "kind": "StringExpression",
                                "value": "Claw Slash"
                            },
                            "power": {
                                "kind": "NumberExpression",
                                "value": 40
                            },
                            "accuracy": {
                                "kind": "NumberExpression",
                                "value": 0.9
                            }
                        }
                    },
                    {
                        "kind": "ObjectExpression",
                        "properties": {
                            "name": {
                                "kind": "StringExpression",
                                "value": "Roar"
                            },
                            "power": {
                                "kind": "NumberExpression",
                                "value": 30
                            },
                            "accuracy": {
                                "kind": "NumberExpression",
                                "value": 1
                            }
                        }
                    },
                    {
                        "kind": "ObjectExpression",
                        "properties": {
                            "name": {
                                "kind": "StringExpression",
                                "value": "Charge"
                            },
                            "power": {
                                "kind": "NumberExpression",
                                "value": 50
                            },
                            "accuracy": {
                                "kind": "NumberExpression",
                                "value": 0.75
                            }
                        }
                    },
                    {
                        "kind": "ObjectExpression",
                        "properties": {
                            "name": {
                                "kind": "StringExpression",
                                "value": "Bite"
                            },
                            "power": {
                                "kind": "NumberExpression",
                                "value": 45
                            },
                            "accuracy": {
                                "kind": "NumberExpression",
                                "value": 0.85
                            }
                        }
                    }
                ]
            }
        },
        {
            "kind": "ConstStatement",
            "name": "animalTypes",
            "value": {
                "kind": "ArrayExpression",
                "elements": [
                    {
                        "kind": "StringExpression",
                        "value": "elephant"
                    },
                    {
                        "kind": "StringExpression",
                        "value": "hippo"
                    },
                    {
                        "kind": "StringExpression",
                        "value": "zebra"
                    }
                ]
            }
        },
        {
            "kind": "ConstStatement",
            "name": "animalEmojis",
            "value": {
                "kind": "ObjectExpression",
                "properties": {
                    "elephant": {
                        "kind": "StringExpression",
                        "value": "🐘"
                    },
                    "hippo": {
                        "kind": "StringExpression",
                        "value": "🦛"
                    },
                    "zebra": {
                        "kind": "StringExpression",
                        "value": "🦓"
                    },
                    "lion": {
                        "kind": "StringExpression",
                        "value": "🦁"
                    }
                }
            }
        },
        {
            "kind": "ClassDeclaration",
            "name": "GridEntity",
            "superClass": null,
            "body": [
                {
                    "kind": "FunctionDeclaration",
                    "isAsync": false,
                    "name": "constructor",
                    "parameters": [
                        "col",
                        "row",
                        "type"
                    ],
                    "body": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ThisExpression"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "col"
                                        }
                                    },
                                    "value": {
                                        "kind": "NameLookupExpression",
                                        "name": "col"
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ThisExpression"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "row"
                                        }
                                    },
                                    "value": {
                                        "kind": "NameLookupExpression",
                                        "name": "row"
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ThisExpression"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "type"
                                        }
                                    },
                                    "value": {
                                        "kind": "NameLookupExpression",
                                        "name": "type"
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ThisExpression"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "hp"
                                        }
                                    },
                                    "value": {
                                        "kind": "NumberExpression",
                                        "value": 50
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ThisExpression"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "maxHp"
                                        }
                                    },
                                    "value": {
                                        "kind": "NumberExpression",
                                        "value": 50
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": []
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ObjectPropertyExpression",
                                            "object": {
                                                "kind": "ThisExpression"
                                            },
                                            "property": {
                                                "kind": "NameLookupExpression",
                                                "name": "element"
                                            }
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "className"
                                        }
                                    },
                                    "value": {
                                        "kind": "StringExpression",
                                        "value": "grid-entity"
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ThisExpression"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "element"
                                        }
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "setAttribute"
                                    },
                                    "arguments": [
                                        {
                                            "kind": "StringExpression",
                                            "value": "data-type"
                                        },
                                        {
                                            "kind": "NameLookupExpression",
                                            "name": "type"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "ThisExpression"
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "render"
                                    },
                                    "arguments": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "kind": "FunctionDeclaration",
                    "isAsync": false,
                    "name": "render",
                    "parameters": [],
                    "body": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ObjectPropertyExpression",
                                            "object": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "ThisExpression"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "element"
                                                }
                                            },
                                            "property": {
                                                "kind": "NameLookupExpression",
                                                "name": "style"
                                            }
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "left"
                                        }
                                    },
                                    "value": {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "MultiplicationExpression",
                                            "left": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "ThisExpression"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "col"
                                                }
                                            },
                                            "right": {
                                                "kind": "NameLookupExpression",
                                                "name": "GRID_SIZE"
                                            }
                                        },
                                        "right": {
                                            "kind": "StringExpression",
                                            "value": "px"
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ObjectPropertyExpression",
                                            "object": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "ThisExpression"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "element"
                                                }
                                            },
                                            "property": {
                                                "kind": "NameLookupExpression",
                                                "name": "style"
                                            }
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "top"
                                        }
                                    },
                                    "value": {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "MultiplicationExpression",
                                            "left": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "ThisExpression"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "row"
                                                }
                                            },
                                            "right": {
                                                "kind": "NameLookupExpression",
                                                "name": "GRID_SIZE"
                                            }
                                        },
                                        "right": {
                                            "kind": "StringExpression",
                                            "value": "px"
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ObjectPropertyExpression",
                                            "object": {
                                                "kind": "ThisExpression"
                                            },
                                            "property": {
                                                "kind": "NameLookupExpression",
                                                "name": "element"
                                            }
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "textContent"
                                        }
                                    },
                                    "value": {
                                        "kind": "OrExpression",
                                        "left": {
                                            "kind": "ArrayAccessExpression",
                                            "array": {
                                                "kind": "NameLookupExpression",
                                                "name": "animalEmojis"
                                            },
                                            "index": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "ThisExpression"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "type"
                                                }
                                            }
                                        },
                                        "right": {
                                            "kind": "StringExpression",
                                            "value": "?"
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "gameGrid"
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "appendChild"
                                    },
                                    "arguments": [
                                        {
                                            "kind": "ObjectPropertyExpression",
                                            "object": {
                                                "kind": "ThisExpression"
                                            },
                                            "property": {
                                                "kind": "NameLookupExpression",
                                                "name": "element"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    "kind": "FunctionDeclaration",
                    "isAsync": false,
                    "name": "remove",
                    "parameters": [],
                    "body": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "ThisExpression"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "element"
                                        }
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "remove"
                                    },
                                    "arguments": []
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "NameLookupExpression",
                                        "name": "gridEntities"
                                    },
                                    "value": {
                                        "kind": "ObjectMethodCallExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "gridEntities"
                                        },
                                        "method": {
                                            "kind": "NameLookupExpression",
                                            "name": "filter"
                                        },
                                        "arguments": [
                                            {
                                                "kind": "ArrowFunctionExpression",
                                                "isAsync": false,
                                                "parameters": [
                                                    "e"
                                                ],
                                                "body": {
                                                    "kind": "InequalityExpression",
                                                    "left": {
                                                        "kind": "NameLookupExpression",
                                                        "name": "e"
                                                    },
                                                    "right": {
                                                        "kind": "ThisExpression"
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "spawnEntities",
            "parameters": [],
            "body": [
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "NameLookupExpression",
                                "name": "gridEntities"
                            },
                            "value": {
                                "kind": "ArrayExpression",
                                "elements": []
                            }
                        }
                    ]
                },
                {
                    "kind": "ForLoop",
                    "init": {
                        "kind": "LetStatement",
                        "name": "i",
                        "value": {
                            "kind": "NumberExpression",
                            "value": 0
                        }
                    },
                    "condition": {
                        "kind": "LessThanExpression",
                        "left": {
                            "kind": "NameLookupExpression",
                            "name": "i"
                        },
                        "right": {
                            "kind": "NumberExpression",
                            "value": 12
                        }
                    },
                    "increment": {
                        "kind": "IncrementExpression",
                        "variable": "i"
                    },
                    "body": [
                        {
                            "kind": "LetListStatement",
                            "names": [
                                "col",
                                "row"
                            ]
                        },
                        {
                            "kind": "DoWhileLoop",
                            "condition": {
                                "kind": "OrExpression",
                                "left": {
                                    "kind": "AndExpression",
                                    "left": {
                                        "kind": "EqualityExpression",
                                        "left": {
                                            "kind": "NameLookupExpression",
                                            "name": "col"
                                        },
                                        "right": {
                                            "kind": "NameLookupExpression",
                                            "name": "playerCol"
                                        }
                                    },
                                    "right": {
                                        "kind": "EqualityExpression",
                                        "left": {
                                            "kind": "NameLookupExpression",
                                            "name": "row"
                                        },
                                        "right": {
                                            "kind": "NameLookupExpression",
                                            "name": "playerRow"
                                        }
                                    }
                                },
                                "right": {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "gridEntities"
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "some"
                                    },
                                    "arguments": [
                                        {
                                            "kind": "ArrowFunctionExpression",
                                            "isAsync": false,
                                            "parameters": [
                                                "e"
                                            ],
                                            "body": {
                                                "kind": "AndExpression",
                                                "left": {
                                                    "kind": "EqualityExpression",
                                                    "left": {
                                                        "kind": "ObjectPropertyExpression",
                                                        "object": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "e"
                                                        },
                                                        "property": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "col"
                                                        }
                                                    },
                                                    "right": {
                                                        "kind": "NameLookupExpression",
                                                        "name": "col"
                                                    }
                                                },
                                                "right": {
                                                    "kind": "EqualityExpression",
                                                    "left": {
                                                        "kind": "ObjectPropertyExpression",
                                                        "object": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "e"
                                                        },
                                                        "property": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "row"
                                                        }
                                                    },
                                                    "right": {
                                                        "kind": "NameLookupExpression",
                                                        "name": "row"
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            "body": [
                                {
                                    "kind": "LineTerminatedExpression",
                                    "expressions": [
                                        {
                                            "kind": "AssignmentExpression",
                                            "target": {
                                                "kind": "NameLookupExpression",
                                                "name": "col"
                                            },
                                            "value": {
                                                "kind": "ObjectMethodCallExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "Math"
                                                },
                                                "method": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "floor"
                                                },
                                                "arguments": [
                                                    {
                                                        "kind": "MultiplicationExpression",
                                                        "left": {
                                                            "kind": "ObjectMethodCallExpression",
                                                            "object": {
                                                                "kind": "NameLookupExpression",
                                                                "name": "Math"
                                                            },
                                                            "method": {
                                                                "kind": "NameLookupExpression",
                                                                "name": "random"
                                                            },
                                                            "arguments": []
                                                        },
                                                        "right": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "GRID_WIDTH"
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                },
                                {
                                    "kind": "LineTerminatedExpression",
                                    "expressions": [
                                        {
                                            "kind": "AssignmentExpression",
                                            "target": {
                                                "kind": "NameLookupExpression",
                                                "name": "row"
                                            },
                                            "value": {
                                                "kind": "ObjectMethodCallExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "Math"
                                                },
                                                "method": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "floor"
                                                },
                                                "arguments": [
                                                    {
                                                        "kind": "MultiplicationExpression",
                                                        "left": {
                                                            "kind": "ObjectMethodCallExpression",
                                                            "object": {
                                                                "kind": "NameLookupExpression",
                                                                "name": "Math"
                                                            },
                                                            "method": {
                                                                "kind": "NameLookupExpression",
                                                                "name": "random"
                                                            },
                                                            "arguments": []
                                                        },
                                                        "right": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "GRID_HEIGHT"
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "kind": "ConstStatement",
                            "name": "type",
                            "value": {
                                "kind": "ArrayAccessExpression",
                                "array": {
                                    "kind": "NameLookupExpression",
                                    "name": "animalTypes"
                                },
                                "index": {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "Math"
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "floor"
                                    },
                                    "arguments": [
                                        {
                                            "kind": "MultiplicationExpression",
                                            "left": {
                                                "kind": "ObjectMethodCallExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "Math"
                                                },
                                                "method": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "random"
                                                },
                                                "arguments": []
                                            },
                                            "right": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "animalTypes"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "length"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "gridEntities"
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "push"
                                    },
                                    "arguments": [
                                        {
                                            "kind": "NewExpression",
                                            "callee": {
                                                "kind": "NameLookupExpression",
                                                "name": "GridEntity"
                                            },
                                            "arguments": [
                                                {
                                                    "kind": "NameLookupExpression",
                                                    "name": "col"
                                                },
                                                {
                                                    "kind": "NameLookupExpression",
                                                    "name": "row"
                                                },
                                                {
                                                    "kind": "NameLookupExpression",
                                                    "name": "type"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "movePlayer",
            "parameters": [
                "dCol",
                "dRow"
            ],
            "body": [
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "NameLookupExpression",
                        "name": "inBattle"
                    },
                    "thenBranch": [
                        {
                            "kind": "ReturnStatement",
                            "value": null
                        }
                    ]
                },
                {
                    "kind": "ConstStatement",
                    "name": "newCol",
                    "value": {
                        "kind": "AdditionExpression",
                        "left": {
                            "kind": "NameLookupExpression",
                            "name": "playerCol"
                        },
                        "right": {
                            "kind": "NameLookupExpression",
                            "name": "dCol"
                        }
                    }
                },
                {
                    "kind": "ConstStatement",
                    "name": "newRow",
                    "value": {
                        "kind": "AdditionExpression",
                        "left": {
                            "kind": "NameLookupExpression",
                            "name": "playerRow"
                        },
                        "right": {
                            "kind": "NameLookupExpression",
                            "name": "dRow"
                        }
                    }
                },
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "OrExpression",
                        "left": {
                            "kind": "OrExpression",
                            "left": {
                                "kind": "OrExpression",
                                "left": {
                                    "kind": "LessThanExpression",
                                    "left": {
                                        "kind": "NameLookupExpression",
                                        "name": "newCol"
                                    },
                                    "right": {
                                        "kind": "NumberExpression",
                                        "value": 0
                                    }
                                },
                                "right": {
                                    "kind": "MoreThanOrEqualExpression",
                                    "left": {
                                        "kind": "NameLookupExpression",
                                        "name": "newCol"
                                    },
                                    "right": {
                                        "kind": "NameLookupExpression",
                                        "name": "GRID_WIDTH"
                                    }
                                }
                            },
                            "right": {
                                "kind": "LessThanExpression",
                                "left": {
                                    "kind": "NameLookupExpression",
                                    "name": "newRow"
                                },
                                "right": {
                                    "kind": "NumberExpression",
                                    "value": 0
                                }
                            }
                        },
                        "right": {
                            "kind": "MoreThanOrEqualExpression",
                            "left": {
                                "kind": "NameLookupExpression",
                                "name": "newRow"
                            },
                            "right": {
                                "kind": "NameLookupExpression",
                                "name": "GRID_HEIGHT"
                            }
                        }
                    },
                    "thenBranch": [
                        {
                            "kind": "ReturnStatement",
                            "value": null
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "NameLookupExpression",
                                "name": "playerCol"
                            },
                            "value": {
                                "kind": "NameLookupExpression",
                                "name": "newCol"
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "NameLookupExpression",
                                "name": "playerRow"
                            },
                            "value": {
                                "kind": "NameLookupExpression",
                                "name": "newRow"
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "renderPlayer",
                            "arguments": []
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "checkEncounter",
                            "arguments": []
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "renderPlayer",
            "parameters": [],
            "body": [
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "NameLookupExpression",
                        "name": "playerEl"
                    },
                    "thenBranch": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "playerEl"
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "remove"
                                    },
                                    "arguments": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "div"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "id"
                                }
                            },
                            "value": {
                                "kind": "StringExpression",
                                "value": "player"
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "div"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "className"
                                }
                            },
                            "value": {
                                "kind": "StringExpression",
                                "value": "grid-entity player"
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "ObjectPropertyExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "div"
                                    },
                                    "property": {
                                        "kind": "NameLookupExpression",
                                        "name": "style"
                                    }
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "left"
                                }
                            },
                            "value": {
                                "kind": "AdditionExpression",
                                "left": {
                                    "kind": "MultiplicationExpression",
                                    "left": {
                                        "kind": "NameLookupExpression",
                                        "name": "playerCol"
                                    },
                                    "right": {
                                        "kind": "NameLookupExpression",
                                        "name": "GRID_SIZE"
                                    }
                                },
                                "right": {
                                    "kind": "StringExpression",
                                    "value": "px"
                                }
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "ObjectPropertyExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "div"
                                    },
                                    "property": {
                                        "kind": "NameLookupExpression",
                                        "name": "style"
                                    }
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "top"
                                }
                            },
                            "value": {
                                "kind": "AdditionExpression",
                                "left": {
                                    "kind": "MultiplicationExpression",
                                    "left": {
                                        "kind": "NameLookupExpression",
                                        "name": "playerRow"
                                    },
                                    "right": {
                                        "kind": "NameLookupExpression",
                                        "name": "GRID_SIZE"
                                    }
                                },
                                "right": {
                                    "kind": "StringExpression",
                                    "value": "px"
                                }
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "div"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "textContent"
                                }
                            },
                            "value": {
                                "kind": "StringExpression",
                                "value": "🦁"
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "ObjectMethodCallExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "gameGrid"
                            },
                            "method": {
                                "kind": "NameLookupExpression",
                                "name": "appendChild"
                            },
                            "arguments": [
                                {
                                    "kind": "NameLookupExpression",
                                    "name": "div"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "checkEncounter",
            "parameters": [],
            "body": [
                {
                    "kind": "ConstStatement",
                    "name": "encountered",
                    "value": {
                        "kind": "ObjectMethodCallExpression",
                        "object": {
                            "kind": "NameLookupExpression",
                            "name": "gridEntities"
                        },
                        "method": {
                            "kind": "NameLookupExpression",
                            "name": "find"
                        },
                        "arguments": [
                            {
                                "kind": "ArrowFunctionExpression",
                                "isAsync": false,
                                "parameters": [
                                    "e"
                                ],
                                "body": {
                                    "kind": "AndExpression",
                                    "left": {
                                        "kind": "EqualityExpression",
                                        "left": {
                                            "kind": "ObjectPropertyExpression",
                                            "object": {
                                                "kind": "NameLookupExpression",
                                                "name": "e"
                                            },
                                            "property": {
                                                "kind": "NameLookupExpression",
                                                "name": "col"
                                            }
                                        },
                                        "right": {
                                            "kind": "NameLookupExpression",
                                            "name": "playerCol"
                                        }
                                    },
                                    "right": {
                                        "kind": "EqualityExpression",
                                        "left": {
                                            "kind": "ObjectPropertyExpression",
                                            "object": {
                                                "kind": "NameLookupExpression",
                                                "name": "e"
                                            },
                                            "property": {
                                                "kind": "NameLookupExpression",
                                                "name": "row"
                                            }
                                        },
                                        "right": {
                                            "kind": "NameLookupExpression",
                                            "name": "playerRow"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "NameLookupExpression",
                        "name": "encountered"
                    },
                    "thenBranch": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "FunctionCallExpression",
                                    "functionName": "startBattle",
                                    "arguments": [
                                        {
                                            "kind": "NameLookupExpression",
                                            "name": "encountered"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "startBattle",
            "parameters": [
                "enemy"
            ],
            "body": [
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "NameLookupExpression",
                                "name": "inBattle"
                            },
                            "value": {
                                "kind": "BooleanExpression",
                                "value": true
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "NameLookupExpression",
                                "name": "battleState"
                            },
                            "value": {
                                "kind": "ObjectExpression",
                                "properties": {
                                    "playerHp": {
                                        "kind": "NumberExpression",
                                        "value": 100
                                    },
                                    "enemyHp": {
                                        "kind": "NumberExpression",
                                        "value": 50
                                    },
                                    "playerMaxHp": {
                                        "kind": "NumberExpression",
                                        "value": 100
                                    },
                                    "enemyMaxHp": {
                                        "kind": "NumberExpression",
                                        "value": 50
                                    },
                                    "playerTurn": {
                                        "kind": "BooleanExpression",
                                        "value": true
                                    },
                                    "enemy": {
                                        "kind": "NameLookupExpression",
                                        "name": "enemy"
                                    },
                                    "type": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "enemy"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "type"
                                        }
                                    }
                                }
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "updateBattleUI",
                            "arguments": []
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "updateBattleIcon",
                            "arguments": [
                                {
                                    "kind": "ObjectPropertyExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "enemy"
                                    },
                                    "property": {
                                        "kind": "NameLookupExpression",
                                        "name": "type"
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "ObjectMethodCallExpression",
                            "object": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleScreen"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "classList"
                                }
                            },
                            "method": {
                                "kind": "NameLookupExpression",
                                "name": "remove"
                            },
                            "arguments": [
                                {
                                    "kind": "StringExpression",
                                    "value": "hidden"
                                }
                            ]
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleLog"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "innerHTML"
                                }
                            },
                            "value": {
                                "kind": "AdditionExpression",
                                "left": {
                                    "kind": "AdditionExpression",
                                    "left": {
                                        "kind": "StringExpression",
                                        "value": "<p>A "
                                    },
                                    "right": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "enemy"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "type"
                                        }
                                    }
                                },
                                "right": {
                                    "kind": "StringExpression",
                                    "value": " appears!</p>"
                                }
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "updateMoves",
                            "arguments": []
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "updateBattleIcon",
            "parameters": [
                "animalType"
            ],
            "body": [
                {
                    "kind": "ConstStatement",
                    "name": "icons",
                    "value": {
                        "kind": "ObjectExpression",
                        "properties": {
                            "elephant": {
                                "kind": "StringExpression",
                                "value": "<ellipse cx=\"40\" cy=\"30\" rx=\"18\" ry=\"20\" fill=\"#A9A9A9\"/><circle cx=\"30\" cy=\"15\" r=\"4\" fill=\"#1a1a1a\"/><circle cx=\"50\" cy=\"15\" r=\"4\" fill=\"#1a1a1a\"/><path d=\"M 35 30 Q 25 45 20 60\" stroke=\"#8B8B8B\" stroke-width=\"8\" fill=\"none\" stroke-linecap=\"round\"/><circle cx=\"30\" cy=\"65\" r=\"4\" fill=\"#8B8B8B\"/><circle cx=\"50\" cy=\"65\" r=\"4\" fill=\"#8B8B8B\"/>"
                            },
                            "hippo": {
                                "kind": "StringExpression",
                                "value": "<ellipse cx=\"40\" cy=\"25\" rx=\"12\" ry=\"14\" fill=\"#FFB6C1\"/><ellipse cx=\"40\" cy=\"50\" rx=\"20\" ry=\"18\" fill=\"#FFC0CB\"/><circle cx=\"32\" cy=\"65\" r=\"7\" fill=\"#FF69B4\"/><circle cx=\"48\" cy=\"67\" r=\"7\" fill=\"#FF69B4\"/><circle cx=\"36\" cy=\"22\" r=\"3\" fill=\"#000\"/><circle cx=\"44\" cy=\"22\" r=\"3\" fill=\"#000\"/><circle cx=\"40\" cy=\"32\" r=\"2\" fill=\"#FF1493\"/>"
                            },
                            "zebra": {
                                "kind": "StringExpression",
                                "value": "<ellipse cx=\"40\" cy=\"30\" rx=\"14\" ry=\"16\" fill=\"#8B7355\"/><ellipse cx=\"40\" cy=\"52\" rx=\"19\" ry=\"17\" fill=\"#A0826D\"/><circle cx=\"30\" cy=\"68\" r=\"6\" fill=\"#654321\"/><circle cx=\"50\" cy=\"70\" r=\"6\" fill=\"#654321\"/><circle cx=\"34\" cy=\"26\" r=\"3\" fill=\"#000\"/><circle cx=\"46\" cy=\"26\" r=\"3\" fill=\"#000\"/><path d=\"M 40 35 L 38 40 L 42 40\" fill=\"#654321\"/>"
                            }
                        }
                    }
                },
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "ArrayAccessExpression",
                        "array": {
                            "kind": "NameLookupExpression",
                            "name": "icons"
                        },
                        "index": {
                            "kind": "NameLookupExpression",
                            "name": "animalType"
                        }
                    },
                    "thenBranch": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "enemyIcon"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "innerHTML"
                                        }
                                    },
                                    "value": {
                                        "kind": "ArrayAccessExpression",
                                        "array": {
                                            "kind": "NameLookupExpression",
                                            "name": "icons"
                                        },
                                        "index": {
                                            "kind": "NameLookupExpression",
                                            "name": "animalType"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "updateBattleUI",
            "parameters": [],
            "body": [
                {
                    "kind": "ConstStatement",
                    "name": "playerPercent",
                    "value": {
                        "kind": "MultiplicationExpression",
                        "left": {
                            "kind": "DivisionExpression",
                            "left": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleState"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "playerHp"
                                }
                            },
                            "right": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleState"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "playerMaxHp"
                                }
                            }
                        },
                        "right": {
                            "kind": "NumberExpression",
                            "value": 100
                        }
                    }
                },
                {
                    "kind": "ConstStatement",
                    "name": "enemyPercent",
                    "value": {
                        "kind": "MultiplicationExpression",
                        "left": {
                            "kind": "DivisionExpression",
                            "left": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleState"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "enemyHp"
                                }
                            },
                            "right": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleState"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "enemyMaxHp"
                                }
                            }
                        },
                        "right": {
                            "kind": "NumberExpression",
                            "value": 100
                        }
                    }
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": []
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": []
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "updateMoves",
            "parameters": [],
            "body": [
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "ObjectMethodCallExpression",
                            "object": {
                                "kind": "ObjectMethodCallExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "Array"
                                },
                                "method": {
                                    "kind": "NameLookupExpression",
                                    "name": "from"
                                },
                                "arguments": [
                                    {
                                        "kind": "ObjectMethodCallExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "movesContainer"
                                        },
                                        "method": {
                                            "kind": "NameLookupExpression",
                                            "name": "querySelectorAll"
                                        },
                                        "arguments": [
                                            {
                                                "kind": "StringExpression",
                                                "value": ".move-btn"
                                            }
                                        ]
                                    }
                                ]
                            },
                            "method": {
                                "kind": "NameLookupExpression",
                                "name": "forEach"
                            },
                            "arguments": [
                                {
                                    "kind": "ArrowFunctionExpression",
                                    "isAsync": false,
                                    "parameters": [
                                        "btn",
                                        "i"
                                    ],
                                    "body": [
                                        {
                                            "kind": "LineTerminatedExpression",
                                            "expressions": [
                                                {
                                                    "kind": "AssignmentExpression",
                                                    "target": {
                                                        "kind": "ObjectPropertyExpression",
                                                        "object": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "btn"
                                                        },
                                                        "property": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "textContent"
                                                        }
                                                    },
                                                    "value": {
                                                        "kind": "ObjectPropertyExpression",
                                                        "object": {
                                                            "kind": "ArrayAccessExpression",
                                                            "array": {
                                                                "kind": "NameLookupExpression",
                                                                "name": "moves"
                                                            },
                                                            "index": {
                                                                "kind": "NameLookupExpression",
                                                                "name": "i"
                                                            }
                                                        },
                                                        "property": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "name"
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "kind": "LineTerminatedExpression",
                                            "expressions": [
                                                {
                                                    "kind": "AssignmentExpression",
                                                    "target": {
                                                        "kind": "ObjectPropertyExpression",
                                                        "object": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "btn"
                                                        },
                                                        "property": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "disabled"
                                                        }
                                                    },
                                                    "value": {
                                                        "kind": "NegationExpression",
                                                        "value": {
                                                            "kind": "ObjectPropertyExpression",
                                                            "object": {
                                                                "kind": "NameLookupExpression",
                                                                "name": "battleState"
                                                            },
                                                            "property": {
                                                                "kind": "NameLookupExpression",
                                                                "name": "playerTurn"
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "playerAttack",
            "parameters": [
                "moveIndex"
            ],
            "body": [
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "OrExpression",
                        "left": {
                            "kind": "NegationExpression",
                            "value": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleState"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "playerTurn"
                                }
                            }
                        },
                        "right": {
                            "kind": "NegationExpression",
                            "value": {
                                "kind": "NameLookupExpression",
                                "name": "inBattle"
                            }
                        }
                    },
                    "thenBranch": [
                        {
                            "kind": "ReturnStatement",
                            "value": null
                        }
                    ]
                },
                {
                    "kind": "ConstStatement",
                    "name": "move",
                    "value": {
                        "kind": "ArrayAccessExpression",
                        "array": {
                            "kind": "NameLookupExpression",
                            "name": "moves"
                        },
                        "index": {
                            "kind": "NameLookupExpression",
                            "name": "moveIndex"
                        }
                    }
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleState"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "playerTurn"
                                }
                            },
                            "value": {
                                "kind": "BooleanExpression",
                                "value": false
                            }
                        }
                    ]
                },
                {
                    "kind": "ConstStatement",
                    "name": "hit",
                    "value": {
                        "kind": "LessThanExpression",
                        "left": {
                            "kind": "ObjectMethodCallExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "Math"
                            },
                            "method": {
                                "kind": "NameLookupExpression",
                                "name": "random"
                            },
                            "arguments": []
                        },
                        "right": {
                            "kind": "ObjectPropertyExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "move"
                            },
                            "property": {
                                "kind": "NameLookupExpression",
                                "name": "accuracy"
                            }
                        }
                    }
                },
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "NameLookupExpression",
                        "name": "hit"
                    },
                    "thenBranch": [
                        {
                            "kind": "ConstStatement",
                            "name": "damage",
                            "value": {
                                "kind": "ObjectMethodCallExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "Math"
                                },
                                "method": {
                                    "kind": "NameLookupExpression",
                                    "name": "floor"
                                },
                                "arguments": [
                                    {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "MultiplicationExpression",
                                            "left": {
                                                "kind": "ObjectMethodCallExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "Math"
                                                },
                                                "method": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "random"
                                                },
                                                "arguments": []
                                            },
                                            "right": {
                                                "kind": "NumberExpression",
                                                "value": 20
                                            }
                                        },
                                        "right": {
                                            "kind": "MultiplicationExpression",
                                            "left": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "move"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "power"
                                                }
                                            },
                                            "right": {
                                                "kind": "NumberExpression",
                                                "value": 0.8
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "battleState"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "enemyHp"
                                        }
                                    },
                                    "value": {
                                        "kind": "ObjectMethodCallExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "Math"
                                        },
                                        "method": {
                                            "kind": "NameLookupExpression",
                                            "name": "max"
                                        },
                                        "arguments": [
                                            {
                                                "kind": "NumberExpression",
                                                "value": 0
                                            },
                                            {
                                                "kind": "SubtractionExpression",
                                                "left": {
                                                    "kind": "ObjectPropertyExpression",
                                                    "object": {
                                                        "kind": "NameLookupExpression",
                                                        "name": "battleState"
                                                    },
                                                    "property": {
                                                        "kind": "NameLookupExpression",
                                                        "name": "enemyHp"
                                                    }
                                                },
                                                "right": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "damage"
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "IncreaseExpression",
                                    "variable": "battleLog.innerHTML",
                                    "amount": {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "AdditionExpression",
                                            "left": {
                                                "kind": "AdditionExpression",
                                                "left": {
                                                    "kind": "AdditionExpression",
                                                    "left": {
                                                        "kind": "StringExpression",
                                                        "value": "<p>You used "
                                                    },
                                                    "right": {
                                                        "kind": "ObjectPropertyExpression",
                                                        "object": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "move"
                                                        },
                                                        "property": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "name"
                                                        }
                                                    }
                                                },
                                                "right": {
                                                    "kind": "StringExpression",
                                                    "value": " for "
                                                }
                                            },
                                            "right": {
                                                "kind": "NameLookupExpression",
                                                "name": "damage"
                                            }
                                        },
                                        "right": {
                                            "kind": "StringExpression",
                                            "value": " damage!</p>"
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    "elseBranch": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "IncreaseExpression",
                                    "variable": "battleLog.innerHTML",
                                    "amount": {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "AdditionExpression",
                                            "left": {
                                                "kind": "StringExpression",
                                                "value": "<p>"
                                            },
                                            "right": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "move"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "name"
                                                }
                                            }
                                        },
                                        "right": {
                                            "kind": "StringExpression",
                                            "value": " missed!</p>"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "updateBattleUI",
                            "arguments": []
                        }
                    ]
                },
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "LessThanOrEqualExpression",
                        "left": {
                            "kind": "ObjectPropertyExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "battleState"
                            },
                            "property": {
                                "kind": "NameLookupExpression",
                                "name": "enemyHp"
                            }
                        },
                        "right": {
                            "kind": "NumberExpression",
                            "value": 0
                        }
                    },
                    "thenBranch": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "IncreaseExpression",
                                    "variable": "battleLog.innerHTML",
                                    "amount": {
                                        "kind": "StringExpression",
                                        "value": "<p>You won! +50 Score!</p>"
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "FunctionCallExpression",
                                    "functionName": "endBattle",
                                    "arguments": [
                                        {
                                            "kind": "BooleanExpression",
                                            "value": true
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "kind": "ReturnStatement",
                            "value": null
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "setTimeout",
                            "arguments": [
                                {
                                    "kind": "NameLookupExpression",
                                    "name": "enemyAttack"
                                },
                                {
                                    "kind": "NumberExpression",
                                    "value": 1000
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "enemyAttack",
            "parameters": [],
            "body": [
                {
                    "kind": "ConstStatement",
                    "name": "move",
                    "value": {
                        "kind": "ArrayAccessExpression",
                        "array": {
                            "kind": "NameLookupExpression",
                            "name": "moves"
                        },
                        "index": {
                            "kind": "ObjectMethodCallExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "Math"
                            },
                            "method": {
                                "kind": "NameLookupExpression",
                                "name": "floor"
                            },
                            "arguments": [
                                {
                                    "kind": "MultiplicationExpression",
                                    "left": {
                                        "kind": "ObjectMethodCallExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "Math"
                                        },
                                        "method": {
                                            "kind": "NameLookupExpression",
                                            "name": "random"
                                        },
                                        "arguments": []
                                    },
                                    "right": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "moves"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "length"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    "kind": "ConstStatement",
                    "name": "hit",
                    "value": {
                        "kind": "LessThanExpression",
                        "left": {
                            "kind": "ObjectMethodCallExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "Math"
                            },
                            "method": {
                                "kind": "NameLookupExpression",
                                "name": "random"
                            },
                            "arguments": []
                        },
                        "right": {
                            "kind": "ObjectPropertyExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "move"
                            },
                            "property": {
                                "kind": "NameLookupExpression",
                                "name": "accuracy"
                            }
                        }
                    }
                },
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "NameLookupExpression",
                        "name": "hit"
                    },
                    "thenBranch": [
                        {
                            "kind": "ConstStatement",
                            "name": "damage",
                            "value": {
                                "kind": "ObjectMethodCallExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "Math"
                                },
                                "method": {
                                    "kind": "NameLookupExpression",
                                    "name": "floor"
                                },
                                "arguments": [
                                    {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "MultiplicationExpression",
                                            "left": {
                                                "kind": "ObjectMethodCallExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "Math"
                                                },
                                                "method": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "random"
                                                },
                                                "arguments": []
                                            },
                                            "right": {
                                                "kind": "NumberExpression",
                                                "value": 20
                                            }
                                        },
                                        "right": {
                                            "kind": "MultiplicationExpression",
                                            "left": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "move"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "power"
                                                }
                                            },
                                            "right": {
                                                "kind": "NumberExpression",
                                                "value": 0.8
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "battleState"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "playerHp"
                                        }
                                    },
                                    "value": {
                                        "kind": "ObjectMethodCallExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "Math"
                                        },
                                        "method": {
                                            "kind": "NameLookupExpression",
                                            "name": "max"
                                        },
                                        "arguments": [
                                            {
                                                "kind": "NumberExpression",
                                                "value": 0
                                            },
                                            {
                                                "kind": "SubtractionExpression",
                                                "left": {
                                                    "kind": "ObjectPropertyExpression",
                                                    "object": {
                                                        "kind": "NameLookupExpression",
                                                        "name": "battleState"
                                                    },
                                                    "property": {
                                                        "kind": "NameLookupExpression",
                                                        "name": "playerHp"
                                                    }
                                                },
                                                "right": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "damage"
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "IncreaseExpression",
                                    "variable": "battleLog.innerHTML",
                                    "amount": {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "AdditionExpression",
                                            "left": {
                                                "kind": "AdditionExpression",
                                                "left": {
                                                    "kind": "AdditionExpression",
                                                    "left": {
                                                        "kind": "StringExpression",
                                                        "value": "<p>Enemy used "
                                                    },
                                                    "right": {
                                                        "kind": "ObjectPropertyExpression",
                                                        "object": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "move"
                                                        },
                                                        "property": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "name"
                                                        }
                                                    }
                                                },
                                                "right": {
                                                    "kind": "StringExpression",
                                                    "value": " for "
                                                }
                                            },
                                            "right": {
                                                "kind": "NameLookupExpression",
                                                "name": "damage"
                                            }
                                        },
                                        "right": {
                                            "kind": "StringExpression",
                                            "value": " damage!</p>"
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    "elseBranch": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "IncreaseExpression",
                                    "variable": "battleLog.innerHTML",
                                    "amount": {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "AdditionExpression",
                                            "left": {
                                                "kind": "StringExpression",
                                                "value": "<p>Enemy's "
                                            },
                                            "right": {
                                                "kind": "ObjectPropertyExpression",
                                                "object": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "move"
                                                },
                                                "property": {
                                                    "kind": "NameLookupExpression",
                                                    "name": "name"
                                                }
                                            }
                                        },
                                        "right": {
                                            "kind": "StringExpression",
                                            "value": " missed!</p>"
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "updateBattleUI",
                            "arguments": []
                        }
                    ]
                },
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "LessThanOrEqualExpression",
                        "left": {
                            "kind": "ObjectPropertyExpression",
                            "object": {
                                "kind": "NameLookupExpression",
                                "name": "battleState"
                            },
                            "property": {
                                "kind": "NameLookupExpression",
                                "name": "playerHp"
                            }
                        },
                        "right": {
                            "kind": "NumberExpression",
                            "value": 0
                        }
                    },
                    "thenBranch": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "IncreaseExpression",
                                    "variable": "battleLog.innerHTML",
                                    "amount": {
                                        "kind": "StringExpression",
                                        "value": "<p>You lost!</p>"
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "FunctionCallExpression",
                                    "functionName": "endBattle",
                                    "arguments": [
                                        {
                                            "kind": "BooleanExpression",
                                            "value": false
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "kind": "ReturnStatement",
                            "value": null
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "ObjectPropertyExpression",
                                "object": {
                                    "kind": "NameLookupExpression",
                                    "name": "battleState"
                                },
                                "property": {
                                    "kind": "NameLookupExpression",
                                    "name": "playerTurn"
                                }
                            },
                            "value": {
                                "kind": "BooleanExpression",
                                "value": true
                            }
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "updateMoves",
                            "arguments": []
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionDeclaration",
            "isAsync": false,
            "name": "endBattle",
            "parameters": [
                "playerWon"
            ],
            "body": [
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "AssignmentExpression",
                            "target": {
                                "kind": "NameLookupExpression",
                                "name": "inBattle"
                            },
                            "value": {
                                "kind": "BooleanExpression",
                                "value": false
                            }
                        }
                    ]
                },
                {
                    "kind": "IfStatement",
                    "condition": {
                        "kind": "NameLookupExpression",
                        "name": "playerWon"
                    },
                    "thenBranch": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "IncreaseExpression",
                                    "variable": "score",
                                    "amount": {
                                        "kind": "NumberExpression",
                                        "value": 50
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "AssignmentExpression",
                                    "target": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "scoreDisplay"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "textContent"
                                        }
                                    },
                                    "value": {
                                        "kind": "AdditionExpression",
                                        "left": {
                                            "kind": "StringExpression",
                                            "value": "Score: "
                                        },
                                        "right": {
                                            "kind": "NameLookupExpression",
                                            "name": "score"
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "ObjectPropertyExpression",
                                        "object": {
                                            "kind": "NameLookupExpression",
                                            "name": "battleState"
                                        },
                                        "property": {
                                            "kind": "NameLookupExpression",
                                            "name": "enemy"
                                        }
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "remove"
                                    },
                                    "arguments": []
                                }
                            ]
                        }
                    ]
                },
                {
                    "kind": "LineTerminatedExpression",
                    "expressions": [
                        {
                            "kind": "FunctionCallExpression",
                            "functionName": "setTimeout",
                            "arguments": [
                                {
                                    "kind": "ArrowFunctionExpression",
                                    "isAsync": false,
                                    "parameters": [],
                                    "body": [
                                        {
                                            "kind": "LineTerminatedExpression",
                                            "expressions": [
                                                {
                                                    "kind": "ObjectMethodCallExpression",
                                                    "object": {
                                                        "kind": "ObjectPropertyExpression",
                                                        "object": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "battleScreen"
                                                        },
                                                        "property": {
                                                            "kind": "NameLookupExpression",
                                                            "name": "classList"
                                                        }
                                                    },
                                                    "method": {
                                                        "kind": "NameLookupExpression",
                                                        "name": "add"
                                                    },
                                                    "arguments": [
                                                        {
                                                            "kind": "StringExpression",
                                                            "value": "hidden"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "kind": "NumberExpression",
                                    "value": 2000
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "ObjectMethodCallExpression",
            "object": {
                "kind": "ObjectMethodCallExpression",
                "object": {
                    "kind": "NameLookupExpression",
                    "name": "Array"
                },
                "method": {
                    "kind": "NameLookupExpression",
                    "name": "from"
                },
                "arguments": [
                    {
                        "kind": "ObjectMethodCallExpression",
                        "object": {
                            "kind": "NameLookupExpression",
                            "name": "movesContainer"
                        },
                        "method": {
                            "kind": "NameLookupExpression",
                            "name": "querySelectorAll"
                        },
                        "arguments": [
                            {
                                "kind": "StringExpression",
                                "value": ".move-btn"
                            }
                        ]
                    }
                ]
            },
            "method": {
                "kind": "NameLookupExpression",
                "name": "forEach"
            },
            "arguments": [
                {
                    "kind": "ArrowFunctionExpression",
                    "isAsync": false,
                    "parameters": [
                        "btn"
                    ],
                    "body": [
                        {
                            "kind": "LineTerminatedExpression",
                            "expressions": [
                                {
                                    "kind": "ObjectMethodCallExpression",
                                    "object": {
                                        "kind": "NameLookupExpression",
                                        "name": "btn"
                                    },
                                    "method": {
                                        "kind": "NameLookupExpression",
                                        "name": "addEventListener"
                                    },
                                    "arguments": [
                                        {
                                            "kind": "StringExpression",
                                            "value": "click"
                                        },
                                        {
                                            "kind": "ArrowFunctionExpression",
                                            "isAsync": false,
                                            "parameters": [],
                                            "body": [
                                                {
                                                    "kind": "LineTerminatedExpression",
                                                    "expressions": [
                                                        {
                                                            "kind": "FunctionCallExpression",
                                                            "functionName": "playerAttack",
                                                            "arguments": [
                                                                {
                                                                    "kind": "FunctionCallExpression",
                                                                    "functionName": "parseInt",
                                                                    "arguments": [
                                                                        {
                                                                            "kind": "ObjectMethodCallExpression",
                                                                            "object": {
                                                                                "kind": "NameLookupExpression",
                                                                                "name": "btn"
                                                                            },
                                                                            "method": {
                                                                                "kind": "NameLookupExpression",
                                                                                "name": "getAttribute"
                                                                            },
                                                                            "arguments": [
                                                                                {
                                                                                    "kind": "StringExpression",
                                                                                    "value": "data-move"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "kind": "FunctionCallExpression",
            "functionName": "spawnEntities",
            "arguments": []
        },
        {
            "kind": "FunctionCallExpression",
            "functionName": "renderPlayer",
            "arguments": []
        }
    ],
    "errors": [
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document",
        "No method calls on document"
    ]
};