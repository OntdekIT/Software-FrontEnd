import React from "react";
import {useState, useEffect} from "react";
import { api } from "../App";

function GiveLanguage(){
    const Language = "Nederlands"
    return Language;
}

function GivePageId(){
    const PageId = "LoginPage"
    return PageId;
}

export default function About() {

    const [Translations, setTranslations] = useState([]);
    useEffect(() =>
    {
        api.get("/Translation/Page?_language=Nederlands&_pageID=LoginPage")
            .then((response) => response.json())
            .then((data) =>
            {
                // setPost(data)
                // posts.map((Bloks) => setPost(Bloks))
                setTranslations(data);
                // console.log(data);
                // console.log(Translations);
                console.log(Translations);
                console.log(Translations);
                console.log(Translations[1], "regel 50");
                fakeArray[0] = Translations[1];
                console.log(fakeArray[0], "regel 52")
            })

            .catch((err) =>
            {
                console.log(err.message);
            });
    }, []);

     //const listTranslations = Translations.bloks.map((bloks,index) =>{
         //return (<div key={index}>bloks</div>);})

    const fakeArray = [];
    const secondFakeArray = [
        ["email", "password"],
        ["email2", "password2"]];

  return (
      <>
          <div>
              {/*{posts.map((bloks)=> {return bloks.map((Translation) => {return Translation.text})})}*/}
              {/*<button onClick={listTranslations}></button>*/}
              {Object.keys(Translations).map((Translation, index) => {return(<div key={index}>{Translations[Translation].text}</div>)})}
              {/*{fakeArray[0].map((a,b) => {return <li key={a + b}>{a}</li>; })}*/}
              {/*{secondFakeArray.map((a,b = 1) => {return <li key={"hoi" + b}>{a}</li>; })}*/}
              {/*{secondFakeArray[0]}*/}
              <h1>Over</h1>
          </div>
          <div>
              <h3>Over ons</h3>
          </div>
      </>
  );
}
