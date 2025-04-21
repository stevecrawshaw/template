---
title: Greenhouse Gas Emissions
description: A dashboard to explore greenhouse gas emissions data
author: Steve Crawshaw
date: 2025-05-01
sidebar: "hide"
full_width: true
logo: "https://s3-eu-central-1.amazonaws.com/aws-ec2-eu-central-1-opendatasoft-staticfileset/westofenglandca/logo?tstamp=17447082559153838"

---
<!-- Queries     -->

```sql epc
SELECT * FROM ods LIMIT 10

```


```sql totals
  select
      calendar_year, cauthnm, sum(emissions_kt_co2e) total_emissions_kt_co2e 
  from emissions
  where sector = 'grand_total'
  group by cauthnm, calendar_year
```

```sql la_totals
  select
      calendar_year, local_authority, cauthnm, sum(emissions_kt_co2e) total_emissions_kt_co2e 
  from emissions
  where sector = 'grand_total' AND calendar_year > ${first_year} AND cauthnm = '${inputs.cauth_1.value}'
  group by cauthnm, calendar_year, local_authority
  -- the inputs need to be quoted when they are a string otherwise sql corrupted
```

```sql per_cap_ca
SELECT * FROM per_cap
```

```sql per_cap_latest
SELECT calendar_year, area cauthnm, per_cap "Per capita emissions (TCO2e pp/pa)" FROM ${per_cap_ca} WHERE calendar_year = ${last_year}
```




```sql first_year
SELECT MAX(calendar_year) - 10 AS first_year FROM emissions
```
```sql start_year
SELECT MIN(calendar_year) AS start_year FROM emissions
```
```sql last_year
SELECT MAX(calendar_year) AS last_year FROM emissions
```


```sql cauth_select
SELECT * FROM ${totals} WHERE cauthnm IN ${inputs.cauth.value} AND calendar_year > ${first_year}
```

```sql pivot_sparklines
-- query to create table for sparklines data table of emissions by time and sector for each CA
WITH piv_stc_tbl AS
(SELECT cauthnm, sector, MAKE_DATE(calendar_year::INTEGER, 1, 1) calendar_year, SUM(emissions_kt_co2e) AS total_emissions
FROM emissions
WHERE calendar_year > ${first_year}
GROUP BY ALL
ORDER BY ALL)
PIVOT piv_stc_tbl
ON sector
USING ARRAY_AGG({'year': calendar_year, 'emissions_kt_co2e': total_emissions}) AS emissions_year
```

```sql sparklines_totals
SELECT cauthnm, COLUMNS('_total') FROM ${pivot_sparklines}
```

```sql sector_totals
SELECT cauthnm,
      calendar_year,
      split_part(sector, '_tot', 1).replace('_', ' ').regexp_replace('^.', substring(sector, 1, 1).upper()) Sector,
      SUM(emissions_kt_co2e) AS total_emissions
FROM emissions
WHERE 
  calendar_year > ${first_year} 
  AND 
  sector LIKE '%_total' AND sector != 'grand_total'
  AND
  cauthnm = '${inputs.cauth_1.value}'
GROUP BY ALL

```

```sql gt_recent
SELECT cauthnm,
      SUM(emissions_kt_co2e) AS grand_total_emissions
FROM emissions
WHERE 
  calendar_year = ${last_year} 
  AND 
  sector != 'grand_total' AND sector LIKE '%_total'
GROUP BY ALL
```



```sql sector_recent
SELECT cauthnm,
            split_part(sector, '_tot', 1).replace('_', ' ').regexp_replace('^.', substring(sector, 1, 1).upper()) Sector,
      SUM(emissions_kt_co2e) AS total_emissions
FROM emissions
WHERE 
  calendar_year = ${last_year} 
  AND 
  sector LIKE '%_total' AND sector != 'grand_total'
GROUP BY ALL
```

```sql sector_perc
-- calculate percentage of sector emisisons from grand total emissions
-- this is a join of the two tables above
SELECT *, (total_emissions / grand_total_emissions)  Emissions_pct FROM ${sector_recent} 
INNER JOIN ${gt_recent} USING (cauthnm)

```

<Image 
    url= {'https://link.assetfile.io/GStAaM21AAeMGlFgY9ub4/Lawrence+Weston+Photos+%281%29.jpg'}
    description="Sample placeholder image"
    
    border=false
    class="p-4"
    align="left"
/>

## Introduction

This dashboard provides an overview of greenhouse gas emissions data for the Combined Authorities in England. The data are broken down by sector and local authority, allowing for a detailed analysis of emissions trends over time. Per capita emissions are also calculated to provide a more meaningful comparison between areas of different sizes.


Data are available for the years <Value data={start_year} fmt='####'/> to <Value data={last_year} fmt='####'/>.  The data are available at the local authority level, and are aggregated to the combined authority level. In this analysis, only the last 10 years of data are used.
<Details title='Data sources'>
Data were sourced from the <Link 
    url="https://www.data.gov.uk/dataset/723c243d-2f1a-4d27-8b61-cdb93e5b10ff/local_authority_carbon_dioxide_emissions"
    label="UK Department for Business, Energy & Industrial Strategy"
    newTab=true
/>
</Details>

## Total Emissions by Combined Authority
### Select multiple Combined Authorities to compare

<Dropdown multiple=true
data={totals}
name=cauth
value=cauthnm
title="Combined Authority"
defaultValue="West of England"/>

CO<sub>2</sub>e Emissions by Combined Authority
<BarChart
    data={cauth_select}
    title="Total emissions by year: all sectors"
    x=calendar_year
    xFmt="YYYY"
    y=total_emissions_kt_co2e
    yAxisTitle="CO2e Emissions (Kte)"
    series=cauthnm
    colorPalette=wecaPaletteNew
    width=800
    height=600 />


## Overview of emissions by sector (all combined authorities)
<DataTable 
data={sparklines_totals}
rows=all
title="Trends by aggregated sector">
<Column id=cauthnm title="Combined Authority"/>
<Column id=grand_total_emissions_year
        title="Grand Total"
        contentType=sparkline
        sparkX=year
        sparkY=emissions_kt_co2e
        interactive=true
        />
<Column id=transport_total_emissions_year
        title="Transport"
        contentType=sparkline
        sparkX=year
        sparkY=emissions_kt_co2e
        interactive=true
        />
</DataTable>


<Dropdown multiple=false
data={totals}
name=cauth_1
value=cauthnm
defaultValue="West of England"
title="Combined Authority"/>

<Grid cols=2>

<LineChart
    data={la_totals}
    title="CO2e Emissions by Constituent Local Authority"
    subtitle="Total emissions by year: all sectors"
    x=calendar_year
    xFmt="####"
    y=total_emissions_kt_co2e
    yAxisTitle="CO2e Emissions (Kte)"
    series=local_authority
    colorPalette=wecaPaletteNew
    width=800
    height=600 />

<LineChart
    data={sector_totals}
    title="CO2e Emissions by Sector"
    subtitle="placeholder"
    x=calendar_year
    xFmt="####"
    y=total_emissions
    yAxisTitle="CO2e Emissions (Kte)"
    series=Sector
    colorPalette=wecaPaletteNew
    width=800
    height=600 />

</Grid>

<BarChart
  data={sector_perc}
  x=cauthnm
  xFmt="####"
  y=Emissions_pct
  series=Sector
  colorPalette=wecaPaletteNew
  title="Percentage of Grand Total Emissions by Sector"
  subtitle="placeholder"
  swapXY=true
  width=800
  height=600
/>
<!--
https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Combined_Authorities_May_2023_Boundaries_EN_BSC/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson -->

## Per - capita emissions by Combined Authority

Comparison of absolute emissions by area can be challenging due to the different population sizes and characteristics of the areas. The following map shows per capita emissions for each Combined Authority in the most recent year available (<Value data={last_year} fmt='####'/>).


<AreaMap 
    data={per_cap_latest} 
    areaCol=cauthnm
    geoJsonUrl='https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Combined_Authorities_May_2023_Boundaries_EN_BSC/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson'
    geoId=CAUTH24NM
    value='Per capita emissions (TCO2e pp/pa)'
    valueFmt='num2'
    height=600
    basemap={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}`}/>

