"use client";
import { MovieCard } from "@/components/movies/movie-card";



export default function Page(){

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
  <MovieCard
    id="1"
    title="O Último Horizonte"
    thumbnailUrl="/images/filme-exemplo.jpg"
    category="Drama"
    creatorName="Maria Silva"
    averageRating={4.5}
    ratingsCount={12}
    synopsis="Uma jornada inesperada que muda a vida de um jovem em busca de um novo começo."

  />
   <MovieCard
    id="1"
    title="O Último Horizonte"
    thumbnailUrl="/images/filme-exemplo.jpg"
    category="Drama"
    creatorName="Maria Silva"
    averageRating={4.5}
    ratingsCount={12}
    synopsis="Uma jornada inesperada que muda a vida de um jovem em busca de um novo começo."

  />
  </div>
  

)


}
