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

```sql emissions_ns
SELECT *
FROM emissions
WHERE  ${inputs.include_ns} = TRUE OR local_authority_code != 'E06000024'
ORDER BY local_authority

```

```sql per_cap_ns
SELECT 
  SUM(em.grand_total) / SUM(em.population_000s_mid_year_estimate) per_cap
  ,em.calendar_year
  -- ,em.local_authority
  -- ,em.local_authority_code
  ,ca.cauthnm
FROM emissions em
INNER JOIN ca_la_tbl ca
ON em.local_authority_code = ca.ladcd
WHERE  (${inputs.include_ns} = TRUE OR ca.ladcd != 'E06000024')
GROUP BY ALL
ORDER BY per_cap
```

```sql per_cap_latest
SELECT calendar_year, cauthnm, per_cap "Per capita emissions (TCO2e pp/pa)" FROM ${per_cap_ns} WHERE calendar_year = ${last_year}
```

```sql totals
  SELECT
      calendar_year, (calendar_year::INTEGER || '-01-01')::DATE "date", cauthnm, sum(emissions_kt_co2e) total_emissions_kt_co2e 
  FROM ${emissions_ns}
  WHERE 
    total_bool
  GROUP BY cauthnm, calendar_year, "date"
```


```sql la_totals
  select
      calendar_year, local_authority, sum(emissions_kt_co2e) total_emissions_kt_co2e 
  from ${emissions_ns}
  where calendar_year > ${first_year} AND cauthnm = '${inputs.cauth_1.value}' AND total_bool
  group by calendar_year, local_authority
  -- the inputs need to be quoted when they are a string otherwise sql corrupted
```


```sql sectors_not_lulucf

SELECT cauthnm, SUM(emissions_kt_co2e) s_emissions, sector FROM ${emissions_ns} 
WHERE calendar_year = ${last_year} AND
  sector != 'lulucf_net_emissions' AND 
  total_bool
GROUP BY ALL

```

```sql sectors

SELECT cauthnm, SUM(emissions_kt_co2e) s_emissions, sector FROM ${emissions_ns} 
WHERE calendar_year = ${last_year} AND total_bool
GROUP BY ALL

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
FROM ${emissions_ns}
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
FROM ${emissions_ns}
WHERE 
  calendar_year > ${first_year} 
  AND 
  total_bool
  AND
  cauthnm = '${inputs.cauth_1.value}'
GROUP BY ALL

```

```sql gt_recent
SELECT cauthnm,
      SUM(s_emissions) AS grand_total_emissions
FROM ${sectors}
GROUP BY ALL

```

```sql sector_recent
SELECT cauthnm,
            split_part(sector, '_tot', 1).replace('_', ' ').regexp_replace('^.', substring(sector, 1, 1).upper()) Sector,
      SUM(s_emissions) AS total_emissions
FROM ${sectors}
GROUP BY ALL

```

```sql sector_perc
-- calculate percentage of sector emisisons from grand total emissions
-- this is a join of the two tables above
SELECT *, (total_emissions / grand_total_emissions)  Emissions_pct 
FROM ${sector_recent} 
INNER JOIN ${gt_recent} USING (cauthnm)
ORDER BY cauthnm, Sector

```

<Image 
    url= {'https://link.assetfile.io/GStAaM21AAeMGlFgY9ub4/Lawrence+Weston+Photos+%281%29.jpg'}
    description="Sample placeholder image"
    border=false
    class="p-4"
    align="left" />

## Introduction

This dashboard provides an overview of greenhouse gas emissions data for the Combined Authorities in England. The data are broken down by sector and local authority, allowing for a detailed analysis of emissions trends over time. Per capita emissions are also calculated to provide a more meaningful comparison between areas of different sizes.

Data are available for the years <Value data={start_year} fmt='####'/> to <Value data={last_year} fmt='####'/>.  The data are available at the local authority level, and are aggregated to the combined authority level. In this analysis, only the last 10 years of data are used.
<Note>
Greenhouse gas emissions include all common climate forcing pollutants, not just carbon dioxide.
</Note>
<Details title='Data sources'>
Data were sourced from the <Link 
    url="https://www.data.gov.uk/dataset/723c243d-2f1a-4d27-8b61-cdb93e5b10ff/local_authority_carbon_dioxide_emissions"
    label="UK Department for Business, Energy & Industrial Strategy"
    newTab=true
/>
<br>
For full reproducibility and transparency, data have been processed and stored on the <Link 
    url="https://app.motherduck.com/"
    label="Motherduck"
    newTab=true 
/> cloud database platform. If you have a motherduck account you can access the database with this code:
<blockquote class="bg-zinc-200"> ATTACH 'md:_share/mca_data/f114fbc4-b46f-4dc4-b445-f039f9121946'; </blockquote>

The <Link
    url="https://evidence.dev/"
    label="Evidence.dev"
    newTab=true/> dashboard code is available on <Link 
    url="https://github.com/stevecrawshaw/template"
    label="GitHub."
    newTab=true
/>
</Details>

<br> North Somerset is not part of the West of England Combined Authority, but you can include it in the analysis by checking the box below.
<p>
<Checkbox
  title="Include North Somerset"
  name="include_ns"
  checked=false
  />
</p>

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
    x=date
    xFmt="YYYY"
    y=total_emissions_kt_co2e
    yAxisTitle="CO2e Emissions (Kte)"
    series=cauthnm
    colorPalette=wecaPaletteNew
    width=800
    height=600/>


## Overview of emissions by sector (all combined authorities)
<DataTable 
data={sparklines_totals}
rows=all
title="Trends by aggregated sector">
<Column id=cauthnm title="Combined Authority"/>
<Column id=commercial_total_emissions_year
        title="Commercial"
        contentType=sparkarea
        sparkX=year
        sparkY=emissions_kt_co2e
        sparkColor=#590075/>

<Column id=public_sector_total_emissions_year
        title="Public Sector"
        contentType=sparkarea
        sparkX=year
        sparkY=emissions_kt_co2e
        sparkColor=#1D4F2B
        />
<Column id=domestic_total_emissions_year
        title="Domestic"
        contentType=sparkarea
        sparkX=year
        sparkY=emissions_kt_co2e
        sparkColor=#40A832
        />
<Column id=industry_total_emissions_year
        title="Industrial"
        contentType=sparkarea
        sparkX=year
        sparkY=emissions_kt_co2e
        sparkColor=#CE132D
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
    chartAreaHeight=400/>

<LineChart
    data={sector_totals}
    title="CO2e Emissions by Sector"
    subtitle="Total emissions by year: top level sectors"
    x=calendar_year
    xFmt="####"
    y=total_emissions
    yAxisTitle="CO2e Emissions (Kte)"
    series=Sector
    colorPalette=wecaPaletteNew
    chartAreaHeight=400/>

</Grid>

For the most recent year (<Value data={last_year} fmt='####'/>) the proportions of greenhouse gas arisings from each sector are shown.

<BarChart
  data={sector_perc}
  x=cauthnm
  xFmt="####"
  y=Emissions_pct
  series=Sector
  colorPalette=wecaPaletteNew
  title="Percentage of Grand Total Emissions by Sector"
  subtitle="Land use (LULUCF) emissions can be negative or positive"
  swapXY=true
  width=800
  height=600/>


## Per - capita emissions by Combined Authority

Comparison of absolute emissions by area can be challenging due to the different population sizes and characteristics of the areas. Per capita emissions can be a fairer comparison metric. The following map shows per capita emissions for each Combined Authority in <Value data={last_year} fmt='####'/>.

{#if inputs.include_ns}

Combined Authorities with North Somerset included in the West of England area.

<AreaMap 
    data={per_cap_latest} 
    areaCol=cauthnm
    geoJsonUrl='https://opendata.westofengland-ca.gov.uk/api/explore/v2.1/catalog/datasets/cauths_weca_as_lep/exports/geojson?lang=en&timezone=Europe%2FLondon'
    geoId=cauth24nm
    value='Per capita emissions (TCO2e pp/pa)'
    valueFmt='num2'
    height=600
    basemap={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}`}/>

{:else}

Combined Authorities with North Somerset excluded from the West of England area.

<AreaMap 
    data={per_cap_latest} 
    areaCol=cauthnm
    geoJsonUrl='https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Combined_Authorities_May_2023_Boundaries_EN_BSC/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson'
    geoId=CAUTH24NM
    value='Per capita emissions (TCO2e pp/pa)'
    valueFmt='num2'
    height=600
    basemap={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}`}/>

{/if}