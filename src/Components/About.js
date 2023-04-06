import React from "react";
import {useState, useEffect} from "react";

/*const App = () => {
    const [posts, setPost] = useState([]);
    useEffect(() =>
    {
        fetch("http://localhost:8082/api/Translation/Page?_language=Nederlands&_pageID=LoginPage")
            .then((response) => response.json())

            .then((data) =>
            {
                setPost(data);
            })

            .catch((err) =>
            {
                console.log(err.message);
            });
    }, []);

return(posts);
};*/

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
        fetch("http://localhost:8082/api/Translation/Page?_language=Nederlands&_pageID=LoginPage")
            .then((response) => response.json())

            .then((data) =>
            {
                // setPost(data)
                // posts.map((Bloks) => setPost(Bloks))
                setTranslations(data);
            })

            .catch((err) =>
            {
                console.log(err.message);
            });
    }, []);

     //const listTranslations = Translations.bloks.map((bloks,index) =>{
         //return (<div key={index}>bloks</div>);})


  return (
    <div>
        {/*{posts.map((bloks)=> {return bloks.map((Translation) => {return Translation.text})})}*/}
        {/*<button onClick={listTranslations}></button>*/}
        {Translations.map((Translation) => {return Translation.text})}
      <h1>Over</h1>
    </div>
  );
}
