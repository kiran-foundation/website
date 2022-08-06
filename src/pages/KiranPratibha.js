import * as React from "react"
import Layout from "../components/Layout"
import Seo from "../components/SEO"
import BannerModule from "../components/BannerModule/BannerModule"
import BasicTextModule from "../components/BasicTextModule/BasicTextModule"
import PerksModule from "../components/PerksModule/PerksModule"
import Perk from "../components/PerksModule/Perk"
import Features from "../components/Features/Features"
import LatestPosts from "../components/Post/LatestPosts"
import CarouselComp from "../components/CarouselComp"
import CarouselSlick from "../components/CarouselSlick"

const KiranPratibha = () => {
  return (
    <>
    <Layout>
        <BannerModule
            title="Welcome to Barcadia"
            subTitle="Using a combination of Gatsby and Contentful, Barcadia is ready to deploy and simple to use."
        />
    </Layout>
    </>
  )
}

export default KiranPratibha
