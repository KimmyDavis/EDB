import Image from "next/image";
import { songs } from "@/constants/songs";

export default function Home() {
  return (
    <div className="p-2">
      {songs.map((song) => {
        return (
          <div className="contarer" key={song.id}>
            <h1 className="mass-section text-2xl font-bold uppercase">{song.section}</h1>
            <h2 className="font-bold text-xl">{song.title}</h2>
            <div className="chorus">
              <h4 className="font-semibold text-lg">Chorus: </h4>
              <div className="chorus-body pl-2">
                {song.chorus.split("\n").map((l) => {
                  return <p>{l}</p>;
                })}
              </div>
            </div>
            <div className="verses">
              {song.verses.map((verse, i) => {
                return (
                  <div className="verse">
                    <h4 className="font-semibold text-lg">verse {i + 1}</h4>
                    <div className="verse-body pl-2">
                      {verse.split("\n").map((v) => {
                        return <p>{v}</p>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
