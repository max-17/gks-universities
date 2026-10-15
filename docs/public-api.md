# Public university API

`GET /api/universities` returns a JSON array of universities. No API key is required. Cross-origin browser requests are allowed. An empty result is `[]`. Without filters, all universities are returned in name order with the existing response format.

## Filters

| Parameter | Matches |
| --- | --- |
| `search` | Partial text in name, city, departments, fields, degrees, track badges, or teaching languages |
| `location` | Exact city |
| `department` | Exact department |
| `field` | Exact field of study |
| `degree` | Exact display value, such as `Master` |
| `applicationTrack` | Exact display value, such as `Embassy` |
| `trackType` | Exact display value, such as `UIC` |
| `medium` | Partial teaching-language text, such as `English` |

Values are case-insensitive and surrounding whitespace is ignored. Repeat a parameter to accept multiple values: `?location=Seoul&location=Busan`. Different program filters must match a single program. Search matches the university's full data independently of the program filters. Returned universities retain all their program data, so consumers can build filter options from the response.

```js
const params = new URLSearchParams({
  location: "Seoul",
  medium: "English",
});
// Replace this origin with the deployed website's URL.
const response = await fetch(`https://YOUR_SITE/api/universities?${params}`);
if (!response.ok) throw new Error(`API request failed: ${response.status}`);
const universities = await response.json();
```

This endpoint currently loads the complete university dataset before filtering. It does not provide pagination.
