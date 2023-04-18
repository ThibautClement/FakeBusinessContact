import React, { useEffect, useRef, useState } from 'react'
import { Session } from '../../models/Reservation/Session'
import { Formateur } from '../../models/Formateur'
import { sessionService } from '../../services/Reservation/SessionService'
import PromotionAddSessionListContainer from '../listContainers/Promotion/PromotionAddSessionListContainer'
import addLogo from '../../assets/img/ajouter.png'

type AddPromotionSessionsProps = {
  sessions: Session[]
  formateurs: Formateur[]
  onAddSession: (session : Session) => void
  onDeleteSession: (session : Session) => void
}

const AddPromotionSessions : React.FC<AddPromotionSessionsProps> = ({sessions, formateurs, onAddSession, onDeleteSession}) => {

  const [search, setSearch] = useState<string>('')

  const [newSessionList, setNewSessionList] = useState<Session[]>([])

  const [session, setSession] = useState<Session>({id: 0, desc: '', startAt: new Date(), endAt: new Date(), formateur: formateurs[0]})

  const [selectedFormateur, setSelectedFormateur] = useState<Formateur>({ id: 0, first_name: '', last_name: '', email: '', createdAt: new Date()})

  const renderPromotionSessionsList = () => {
    const filteredSessions = newSessionList.filter((session: Session) => {
        const name = `
          ${session.desc.toLocaleLowerCase()}  
          ${session.startAt.toString().slice(0, 10)} 
          ${session.endAt.toString().slice(0, 10)} 
          ${session.formateur.first_name.toLocaleLowerCase()} 
          ${session.formateur.last_name.toLocaleLowerCase()}`
        ;
        return search === '' ? session : name.includes(search);
    });

    return filteredSessions.map((session: Session) => {
      return (
        <PromotionAddSessionListContainer
          key={session.id} 
          session={session}
          onDeleteSession={handleDeleteSession}
        />
      );
    });
  };

  const formateDateForm = (date : Date): string => {
    const formatedDate : string = date.toLocaleString('fr-FR').slice(0, 10);
    return formatedDate;
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'startAt' || name === 'endAt') {
      const date = new Date(value);
      setSession(prevState => Object.assign({}, prevState, { [name]: date.toISOString() }));
    } else if (name === 'desc') {
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      setSession(prevState => Object.assign({}, prevState, { [name]: capitalizedValue}));
    }
  }

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const selectedFormateur = formateurs.find((formateur) => formateur.last_name === selectedValue )
    setSession((prevState) => ({
      ...prevState,
      formateur: selectedFormateur !== undefined ? selectedFormateur : prevState.formateur
    }))
    if (selectedFormateur) {
      setSelectedFormateur(selectedFormateur)
    }
  }

  const IsOverlapping = (newSession : Session) : boolean => {
    for (const session of newSessionList) {
      if (
        (newSession.startAt >= session.startAt && newSession.startAt <= session.endAt) ||
        (newSession.endAt >= session.startAt && newSession.endAt <= session.endAt)
      ) {
        return true;
      }
    }
    return false;
  }

  const handleCreateSession = (sessionToCreate : Session) => {
    sessionService
      .createSession(sessionToCreate)
      .then((res) => {
        const newSession : Session = {...sessionToCreate, id: res.id};
        onAddSession(newSession)
        setNewSessionList([...newSessionList, newSession])
      })
      .then(() => {
        setSession({id: 0, desc: '', startAt: new Date(), endAt: new Date(), formateur: formateurs[0]})
      })
      .catch((error) => console.error(error))
    ;
  }

  const handleDeleteSession = (sessionToDelete : Session) => {
    const newListOfSession : Session[] = newSessionList.filter((s : Session) => s.id !== sessionToDelete.id)
    setNewSessionList(newListOfSession)
    onDeleteSession(sessionToDelete)
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (IsOverlapping(session)) {
      alert("Les dates de cette session sont incompatible avec la liste de sessions en cours !")
    } else {
      handleCreateSession(session)
    }
  }
  
  return (
    <>
      <section className='sessionsAddPromotion'>
        <div className="filterBarPromotionFiche">
          <div className="allPromotionFiche">Sessions</div>
          <input
            className="searchInputPromotionFiche"
            type="search"
            placeholder="   Recherche ..."
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className='sumPromotionFiche'>{newSessionList.length}</div>
        </div>
        <form className='formSectionSessionsPromotions' onSubmit={handleFormSubmit}>
          <div className="addSessionMenu">
            <div className="inputBoxSession">
              <input
                type="text"
                name="desc"
                placeholder='Nom de la session'
                value={session.desc}
                onChange={handleInputChange}
                className='descriptionTextSession'
                required
              />
            </div>
            <div className="inputBoxSession">
              <input
                type="date"
                name="startAt"
                value={formateDateForm(session.startAt)}
                onChange={handleInputChange}
                className='inputTextSession'
                required
              />
            </div>
            <div className="inputBoxSession">
              <input
                type="date"
                name="endAt"
                value={formateDateForm(session.endAt)}
                onChange={handleInputChange}
                className='inputTextSession'
                required
              />
            </div>
              <select
                  name="formateur"
                  value={selectedFormateur.last_name}
                  onChange={handleSelectChange}
                  className='formateurSelectSession'
                  required
                >
                  <option value=''>-- Formateurs --</option>
                  {formateurs.map((formateur) => (
                    <option key={formateur.id} value={formateur.last_name} className="formateurInputContainer">
                      {formateur.first_name} {formateur.last_name}
                    </option>
                  ))}
              </select>
            <button type='submit' className='formAddButtonSessionsPromotion'>
              <img src={addLogo} className='addLogoForm'/>
            </button>
          </div>
        </form>
        <div className="gridSessionPromotionFiche">
          <h3 className="gridTitlePromotionFiche">Description</h3>
          <h3 className="gridTitlePromotionFiche">DD</h3>
          <h3 className="gridTitlePromotionFiche">DF</h3>
          <h3 className="gridTitlePromotionFiche">Formateur</h3>
        </div>
        <div className="listContainerPromotionFiche">{renderPromotionSessionsList()}</div>
      </section>
    </>
  )
}

export default AddPromotionSessions