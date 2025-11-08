import { Redirect } from 'expo-router';

const REDIRECT_ROUTE_DASHBOARD = '/(tabs)/dashboard';
const REDIRECT_ROUTE_CLASS = '/(tabs)/clase'; 
const REDIRECT_ROUTE_ONBOARDING = '/onboarding';
const REDIRECT_ROUTE_ADDCLASS = '/QADir/Clases/AddClassScreen'; 
const REDIRECT_ROUTE_ADDPROFESSOR = '/QADir/Professors/AddProfessorScreen'; 
const REDIRECT_ROUTE_CLASS_MODAL = '/QADir/Clases/ClassModalScreen'; 
const REDIRECT_ROUTE_ALL_CLASS_MODAL = '/QADir/Clases/SeeAllClasesScreen'; 

export default function AppIndex() {
  return <Redirect href={REDIRECT_ROUTE_ADDCLASS} />;
  //return <Redirect href={REDIRECT_ROUTE_DASHBOARD} />;
  //return <Redirect href={REDIRECT_ROUTE_CLASS_MODAL} />;
  //return <Redirect href={REDIRECT_ROUTE_CLASS} />;
  //return <Redirect href={REDIRECT_ROUTE_ADDPROFESSOR} />;
  //return <Redirect href={REDIRECT_ROUTE_ONBOARDING} />;
  //return <Redirect href={REDIRECT_ROUTE_ALL_CLASS_MODAL} />;
}