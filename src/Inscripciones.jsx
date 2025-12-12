import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function Inscripciones() {
  const inscripciones = []

  const getStatusIcon = (status) => {
    switch (status) {
      case "alert":
        return <i class="fa-regular fa-circle-xmark" style={{color: "red"}}></i>
      case "success":
        return <i class="fa-regular fa-circle-check" style={{color: "green"}}></i>
      case "pending":
        return <i class="fa-regular fa-circle-pause" style={{color: "yellow"}}></i>
      default:
        return null
    }
  }
  
  const navigate = useNavigate();

  return(<>
  <Header/>
  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
    <h1>Tus Inscripciones</h1>
    <aside>
      <button className='new-insc-button'
        onClick={() => {navigate('/nueva-inscripcion', { replace: true });}}>
          Nueva inscripción
          </button>
      </aside>
      </div>
      <p className="inscription-null">Aún no te has inscrito a ningún grupo.</p>
      </>)
  }