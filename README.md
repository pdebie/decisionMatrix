# decisionMatrix

## Description

is a Restful API to build and search in a Matrix

##### This Matrix

| a | b | c | Result |
| ---- | ---- | ---- | ----  |
| 1 | 2 | 3 | units  |
| 11 | 12 | 13 | ten |
| 21 | 22 | 23 | twenty |

##### This search 

```javascript
a: 11, b:12, c:13
```

    will return : ten

## Build

```shell
curl -i -X POST \
   -H "Content-Type:application/json" \
   -d \
'{ 
  "action": "store",
  "name": "aname",
  "definition": "a;b;c;result\n1;2;3;chiffres\n11;12;13;dizaines"
}' \
 'url/matrix/'
```

## Search
 
```shell
 curl -i -X POST \
   -H "Content-Type:application/json" \
   -d \
'{ 
  "action": "search",
  "name": "aname",
  "q": {
    "a": "11", 
    "b": "12",
    "c": "13"
  }
}' \
 'url/matrix/'
```

## GET all matrix definition

```shell
curl -i -X GET \
 'url/matrix/'
```

## Future

Accept many matrix referenced by name
