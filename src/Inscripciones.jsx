import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function Inscripciones() {
  const inscripciones = [
    {
      id: 1,
      idioma: "Japonés",
      codigo: "JBAS-101",
      campus: "Coatzacoalcos",
      nrc: "12345",
      status: "alert",
    },
    {
      id: 2,
      idioma: "Japonés",
      codigo: "JBAS-101",
      campus: "Coatzacoalcos",
      nrc: "12345",
      status: "success",
    },
    {
      id: 3,
      idioma: "Japonés",
      codigo: "JBAS-101",
      campus: "Coatzacoalcos",
      nrc: "12345",
      status: "pending",
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "alert":
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "pending":
        return <Smile className="h-6 w-6 text-yellow-500" />
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