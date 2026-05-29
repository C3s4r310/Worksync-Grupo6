import TareaBoard from '../components/tareas/TareaBoard';

interface TareasPageProps {
  proyectoId?: number;
  nombreProyecto?: string;
}

export default function TareasPage({
  proyectoId = 1,
  nombreProyecto = 'Proyecto de prueba',
}: TareasPageProps) {
  return (
    <TareaBoard
      proyectoId={proyectoId}
      nombreProyecto={nombreProyecto}
    />
  );
}