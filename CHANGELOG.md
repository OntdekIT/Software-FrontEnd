# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2024-01-08

### Added
- Dockerfile toegevoegd (SCRUM-162)

## [0.3.6] - 2023-12-18

### Added
- Project naam in navigatiebalk
- Logo toegevoegd voor gebruik als thumbnail

### Changed
- Color legend is aangepast en bevat nu één temp per color block. De temperature ranges bevatten nu altijd de min en max temps.

### Fixed
- Ongebruikte componenten en pagina's verwijderd

## [0.3.5] - 2023-12-11

### Fixed
- Center en zoom liet bij inladen niet heel Tilburg zien (SCRUM-124)
- Kleurenpallet aangepast na feedback opdrachtever, bevat nu sterkere verschillen in rood (SCRUM-159)
- Kleurenpallet code duplicatie in Wijkkaart weggehaald
- Donkergrijze i.p.v. doorzichtige wijkvlakken (SCRUM-167)

## [0.3.4] - 2023-12-04

### Added

- Legenda voor de kleuren op de kaart toegevoegd (SCRUM-77)
- Error handling toegevoegd
- Wijkgeschiedenis weergave in grafiek toegevoegd (SCRUM-124)

### Fixed

- Conflict met namen in de CSS opgelost

## [0.3.3] - 2023-11-29

### Changed

- Kleuren van de heatmap en region layer zijn aangepast naar een kleurblind vriendelijk palet en zijn in lib geplaatst (SCRUM-146)

## [0.3.2] - 2023-11-22

### Fixed

- Kalender is in te stellen naar toekomstige datum (SCRUM-145)
- Startdatum instelbaar na Einddatum + Einddatum instelbaar voor Startdatum (SCRUM-144)

## [0.3.1] - 2023-11-15

### Added

- Mogelijkheid om te schakelen tussen verschillende typen data binnen de heatmap (SCRUM-137)

### Fixed

- Popup sluit na het selecteren van de datum in calender van de popup (SCRUM-129)
- Heatmap blijft staan als je terug naar wijk-view switched (SCRUM-116)

## [0.3.0] - 2023-11-13

### Fixed

- Timestamp in Measurement is niet tijdzone onafhankelijk (SCRUM-114)
- Metingen die geen locatie hebben ontbreken op de map (SCRUM-117)
- Heatmap crashed wanneer je te ver uitzoomt (SCRUM-115)
- De grafieken onder marker werkt niet, vanwege update react-leaflet plugin (SCRUM-121)
- Latitude en longitude zijn 2x omgewisseld (SCRUM-104)
- Toggle Region werkt niet meer (SCRUM-120)

## [0.2.1] - 2023-11-08

### Added

- Marker op een kaart van Tilburg toont meetgeschiedenis meetstation in grafiek (SCRUM-57)
- Marker op een kaart van Tilburg toont temperatuur op een bepaald punt in de tijd (SCRUM-9)

### Changed

- Heatmap plugin veranderd naar leaflet-heatmap.js (SCRUM-44)
- Type heatmap veranderd van 'proximity' naar 'weighted' (SCRUM-44)
- Gemiddelde van laatst gemeten temperatuur per wijk nu zichtbaar in kleur op een kaart van Tilburg (SCRUM-45)

### Fixed

- Wijken hebben overlap met elkaar (SCRUM-103)
- Luchtvochtigheid geeft overal 'NaN' aan (SCRUM-102)

## [0.2.0] - 2023-10-30

### Added

- Gemiddelde van laatst gemeten temperatuur per wijk zichtbaar op een kaart van Tilburg (SCRUM-39)

## [0.1.0] - 2023-10-24

### Added

- Marker op een kaart van Tilburg toont actuele temperaturen (SCRUM-42)

## [0.0.0]

Alles voor deze datum wordt als legacy code beschouwt en is niet bijgehouden in een Changelog
