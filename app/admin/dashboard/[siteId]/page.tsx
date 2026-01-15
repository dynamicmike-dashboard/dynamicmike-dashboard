import { getSiteByDomain } from "@/lib/sites"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, FileText, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { notFound } from "next/navigation"

export default async function SiteDetailsPage({ params }: { params: { siteId: string } }) {
  const site = getSiteByDomain(params.siteId)
  if (!site) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">{site.name}</h1>
          <p className="text-slate-400">{site.domain}</p>
        </div>
        <a 
          href={`https://${site.domain}`} 
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 text-cyan-400 hover:bg-slate-700 transition-colors"
        >
          View Live Site <ExternalLink size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Rescue Status */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 uppercase">Status</CardTitle>
            <CheckCircle className="text-green-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Live & Synced</div>
            <p className="text-xs text-slate-500 mt-1">Last rescue: 2 hours ago</p>
          </CardContent>
        </Card>

        {/* Metric 2: Content Count */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 uppercase">Pages</CardTitle>
            <FileText className="text-cyan-400" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">24 Pages</div>
            <p className="text-xs text-slate-500 mt-1">Incl. English & Spanish versions</p>
          </CardContent>
        </Card>

        {/* Metric 3: Media Storage */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 uppercase">Media Assets</CardTitle>
            <Globe className="text-purple-400" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">142 Files</div>
            <p className="text-xs text-slate-500 mt-1">Connected to Google Drive</p>
          </CardContent>
        </Card>
      </div>

      {/* Migration Alert Section */}
      <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-900 flex gap-4 items-start">
        <AlertCircle className="text-cyan-400 mt-1" size={20} />
        <div>
          <h4 className="font-semibold text-cyan-400">Migration Insight</h4>
          <p className="text-sm text-slate-300">
            Detected 3 orphan pages not in the sitemap. Added to rescue queue automatically.
          </p>
        </div>
      </div>
    </div>
  )
}