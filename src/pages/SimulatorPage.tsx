import FilterSidebar from '../components/FilterSidebar'
import CardGrid from '../components/CardGrid'
import RightPanel from '../components/RightPanel'
import Topbar from '../components/Topbar'
import DetailModal from '../components/DetailModal'

export default function SimulatorPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f6f2]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar />
        <CardGrid />
        <RightPanel />
      </div>
      <DetailModal />
    </div>
  )
}
