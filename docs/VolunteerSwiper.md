#       ----------------------------------to use swiper card of jobs and internship-----------------------------------------

serve file :  src -> common -> VolunteerSwiper.astro 
VolunteerSwiper : this file contain swiper componet : it can take prop for container not card 
so, to change container styling pass prop as tailwind class named : `className={} ` make tailwind `!` important in case of not working 
                        `       <VolunteerSwiper Data={jobs} className={"!mb-0 bg-[#F1F1F1]"}/>       `
                        
----------------------------------------------------------------------------------------------------------------------------
-------------------------------------Two use Button
        <Button
          link="/volunteering"
          title="Become a Volunteer"
          btn="btn1"                      [3 button option available here btn1,2,3]
          widthClass="w-full"
          heightClass="h-[60px]"
        />