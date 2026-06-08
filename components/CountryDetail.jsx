import React, { useEffect, useState } from "react";
import "./CountryDetail.css";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";

export default function CountryDetail() {
  const [isDark] = useTheme();
  const { country } = useParams();
  const { state } = useLocation();

  const [countryData, setCountryData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  function updateCountryData(data) {
    setCountryData({
      name: data.name?.common,
      nativeName: data.name?.nativeName
        ? Object.values(data.name.nativeName)[0]?.common
        : data.name?.common,
      population: data.population,
      region: data.region,
      subregion: data.subregion,
      capital: data.capital || [],
      flag: data.flags?.svg,
      tld: data.tld?.join(", "),
      languages: data.languages
        ? Object.values(data.languages).join(", ")
        : "",
      currencies: data.currencies
        ? Object.values(data.currencies)
            .map((c) => c.name)
            .join(", ")
        : "",
      borders: data.borders || [],
    });

    if (!data.borders) return;

    Promise.all(
      data.borders.map((border) =>
        fetch(`https://restcountries.com/v3.1/alpha/${border}`)
          .then((res) => res.json())
          .then(([country]) => country.name.common)
      )
    ).then((borders) => {
      setCountryData((prev) => ({ ...prev, borders }));
    });
  }

  useEffect(() => {
  fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`)
    .then((res) => {
      if (!res.ok) throw new Error("Country not found")
      return res.json()
    })
    .then(([data]) => updateCountryData(data))

    .catch(() => setNotFound(true))
}, [country]);

console.log(country)

  if (notFound) return <div>Country Not Found</div>;
  if (!countryData) return <div>Loading...</div>;

  console.log(countryData?.flag)

  return (
    <main className={isDark ? "dark" : ""}>
      <div className="country-details-container">
        <span className="back-button" onClick={() => history.back()}>
          ← Back
        </span>
       
        <div className="country-details">
          <img src={countryData.flag} alt={countryData.name} />

          <div className="details-text-container">
            <h1>{countryData.name}</h1>

            <p><b>Native Name:</b> {countryData.nativeName}</p>
            <p><b>Population:</b> {countryData.population.toLocaleString()}</p>
            <p><b>Region:</b> {countryData.region}</p>
            <p><b>Sub Region:</b> {countryData.subregion}</p>
            <p><b>Capital:</b> {countryData.capital.join(", ")}</p>
            <p><b>Top Level Domain:</b> {countryData.tld}</p>
            <p><b>Currencies:</b> {countryData.currencies}</p>
            <p><b>Languages:</b> {countryData.languages}</p>

            {countryData.borders.length > 0 && (
              <div className="border-countries">
                <b>Border Countries:</b>
                {countryData.borders.map((border) => (
                  <Link key={border} to={`/${border}`}>
                    {border}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );

}